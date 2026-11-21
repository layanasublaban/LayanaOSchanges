// Life OS assistant: verifies the Neon Auth JWT, then lets an LLM act on the owner's data
// through the Neon Data API using the caller's own token (row-level security still applies).
import crypto from 'node:crypto';

const env = (k, d = '') => process.env[k] || d;
const AUTH_BASE = () => env('AUTH_BASE_URL', env('NEON_AUTH_BASE_URL'));
const JWKS_URL = () => env('NEON_AUTH_JWKS_URL', AUTH_BASE() + '/.well-known/jwks.json');
const DATA = () => env('DATA_API_URL', env('NEON_DATA_API_URL'));
const ORIGINS = () => env('ALLOWED_ORIGINS', 'https://layanaos.figma.site').split(',');
const MODEL = () => env('MODEL', 'claude-sonnet-4-6');

const cors = (req) => {
  const o = req.headers.get('origin') || '';
  const ok = ORIGINS().includes(o) || /^http:\/\/localhost:\d+$/.test(o) || /\.figma\.site$/.test(o);
  return {
    'Access-Control-Allow-Origin': ok ? o : ORIGINS()[0],
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    Vary: 'Origin',
  };
};
const json = (req, body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...cors(req) } });

let jwksCache = { at: 0, keys: [] };
async function getKeys() {
  if (Date.now() - jwksCache.at < 10 * 60_000 && jwksCache.keys.length) return jwksCache.keys;
  const r = await fetch(JWKS_URL());
  jwksCache = { at: Date.now(), keys: (await r.json()).keys ?? [] };
  return jwksCache.keys;
}
const b64 = (s) => Buffer.from(s, 'base64url');

async function verify(token) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new Error('bad token');
  const header = JSON.parse(b64(h).toString());
  const payload = JSON.parse(b64(p).toString());
  const jwk = (await getKeys()).find((k) => !header.kid || k.kid === header.kid);
  if (!jwk) throw new Error('unknown key');
  const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const alg = header.alg === 'EdDSA' ? null : 'sha256';
  if (!crypto.verify(alg, Buffer.from(`${h}.${p}`), key, b64(s))) throw new Error('bad signature');
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('expired');
  if (AUTH_BASE() && payload.iss && payload.iss !== new URL(AUTH_BASE()).origin) throw new Error('bad issuer');
  return payload;
}

async function db(token, path, init = {}) {
  const r = await fetch(`${DATA()}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, prefer: 'return=representation', ...(init.headers ?? {}) },
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`data api ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}

const TOOLS = [
  ['create_event', 'Create a calendar event or meeting. Times are ISO 8601 with the user timezone offset.', {
    title: { type: 'string' }, space: { type: 'string', enum: ['Personal', 'Business', 'Lensiyana'] },
    start: { type: 'string', description: 'ISO start' }, end: { type: 'string', description: 'ISO end' },
    is_meeting: { type: 'boolean', description: 'true if it needs a Google Meet link' }, notes: { type: 'string' },
  }, ['title', 'start', 'end']],
  ['list_events', 'List events between two ISO times.', { from: { type: 'string' }, to: { type: 'string' } }, ['from', 'to']],
  ['update_event', 'Change an event by id.', {
    id: { type: 'string' }, title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' },
    space: { type: 'string', enum: ['Personal', 'Business', 'Lensiyana'] }, is_meeting: { type: 'boolean' },
  }, ['id']],
  ['delete_event', 'Delete an event by id.', { id: { type: 'string' } }, ['id']],
  ['add_task', 'Add a to-do.', { title: { type: 'string' } }, ['title']],
  ['list_tasks', 'List to-dos.', {}, []],
].map(([name, description, properties, required]) => ({
  type: 'function', function: { name, description, parameters: { type: 'object', properties, required } },
}));

async function runTool(token, name, a) {
  switch (name) {
    case 'create_event': {
      const [row] = await db(token, '/events', { method: 'POST', body: JSON.stringify({
        title: a.title, space: a.space || 'Business', starts_at: a.start, ends_at: a.end,
        is_meeting: !!a.is_meeting, notes: a.notes ?? null,
      }) });
      return { created: row.id, title: row.title, google_meet: 'not connected yet, the Meet link will be added once Google Calendar is connected' };
    }
    case 'list_events':
      return db(token, `/events?select=id,title,space,starts_at,ends_at,is_meeting&starts_at=gte.${encodeURIComponent(a.from)}&starts_at=lte.${encodeURIComponent(a.to)}&order=starts_at.asc&limit=50`);
    case 'update_event': {
      const { id, start, end, ...rest } = a;
      const patch = { ...rest, ...(start ? { starts_at: start } : {}), ...(end ? { ends_at: end } : {}) };
      const rows = await db(token, `/events?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
      return { updated: rows?.length ?? 0 };
    }
    case 'delete_event':
      await db(token, `/events?id=eq.${encodeURIComponent(a.id)}`, { method: 'DELETE' });
      return { deleted: true };
    case 'add_task': {
      const [row] = await db(token, '/tasks', { method: 'POST', body: JSON.stringify({ title: a.title }) });
      return { created: row.id };
    }
    case 'list_tasks':
      return db(token, '/tasks?select=id,title,done&order=created_at.asc&limit=50');
    default:
      return { error: 'unknown tool' };
  }
}

async function chat(messages) {
  const r = await fetch(`${env('NEON_AI_GATEWAY_BASE_URL')}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env('AI_GATEWAY_TOKEN', env('NEON_AI_GATEWAY_TOKEN'))}` },
    body: JSON.stringify({ model: MODEL(), messages, tools: TOOLS, max_tokens: 1024 }),
  });
  if (!r.ok) throw new Error(`gateway ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).choices[0].message;
}

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method === 'GET')
      return json(req, { ok: true, gateway: !!env('AI_GATEWAY_TOKEN', env('NEON_AI_GATEWAY_TOKEN')), data: !!DATA(), auth: !!AUTH_BASE() });
    const m = /^Bearer (.+)$/i.exec(req.headers.get('authorization') || '');
    if (!m) return json(req, { error: 'Unauthorized' }, 401);
    const token = m[1];
    try {
      await verify(token);
      if ((await db(token, '/rpc/is_owner', { method: 'POST', body: '{}' })) !== true) return json(req, { error: 'Forbidden' }, 403);
    } catch {
      return json(req, { error: 'Unauthorized' }, 401);
    }
    try {
      const { messages = [], now, timezone = 'Asia/Amman' } = await req.json();
      const system = `You are Layana's personal assistant inside her private Life OS. She writes English or Jordanian Arabic: reply in the language she used. Be brief and warm.
Current time: ${now || new Date().toISOString()} (timezone ${timezone}, UTC+03:00). Weeks start on Monday.
Use the tools to really create, change or delete events and tasks, never pretend. Resolve relative times ("tomorrow at 3") against the current time and send ISO strings with the +03:00 offset. Default length 1 hour. Space: Business for work and clients, Lensiyana for content, otherwise Personal.
For meetings set is_meeting true. Google Calendar is not connected yet, so there is no Google Meet link: say plainly that the meeting is saved and the link will appear after Google is connected. If a time is unclear, ask one short question. To edit or delete, list events first to find the id.`;
      const convo = [{ role: 'system', content: system }, ...messages.slice(-20)];
      const actions = [];
      for (let i = 0; i < 6; i++) {
        const msg = await chat(convo);
        convo.push(msg);
        if (!msg.tool_calls?.length) return json(req, { reply: msg.content ?? '', actions });
        for (const call of msg.tool_calls) {
          let out;
          try {
            out = await runTool(token, call.function.name, JSON.parse(call.function.arguments || '{}'));
            if (!call.function.name.startsWith('list_')) actions.push(call.function.name);
          } catch (e) {
            out = { error: String(e.message || e) };
          }
          convo.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(out) });
        }
      }
      return json(req, { reply: 'I could not finish that. Please try again.', actions });
    } catch (e) {
      return json(req, { error: String(e.message || e) }, 500);
    }
  },
};
