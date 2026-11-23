// Life OS assistant (no-login version): a passcode-protected proxy to the AI model.
// It only talks to the AI. The browser runs the tools (create/list/update/delete events, tasks).
import crypto from 'node:crypto';

function env(k, d) {
  return process.env[k] || d || '';
}

var GATEWAY = 'https://br-weathered-rain-b9s2ocjb-api.ai.c-7.eu-central-1.aws.neon.tech';

function cors(req) {
  var o = req.headers.get('origin') || '';
  var allowed = env('ALLOWED_ORIGINS', 'https://layanaos.figma.site').split(',');
  var ok = allowed.indexOf(o) !== -1 || /^http:\/\/localhost:\d+$/.test(o) || /\.figma\.site$/.test(o);
  return {
    'Access-Control-Allow-Origin': ok ? o : allowed[0],
    'Access-Control-Allow-Headers': 'content-type, x-passcode',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Vary': 'Origin'
  };
}

function json(req, body, status) {
  var headers = { 'content-type': 'application/json' };
  var c = cors(req);
  Object.keys(c).forEach(function (k) { headers[k] = c[k]; });
  return new Response(JSON.stringify(body), { status: status || 200, headers: headers });
}

function passOk(given) {
  var want = env('ASSISTANT_PASSCODE');
  if (!want || !given) return false;
  var a = Buffer.from(String(given));
  var b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function tool(name, description, properties, required) {
  return { type: 'function', function: { name: name, description: description, parameters: { type: 'object', properties: properties, required: required } } };
}

var SPACES = ['Personal', 'Business', 'Lensiyana'];
var TOOLS = [
  tool('create_event', 'Create a calendar event or meeting. Times are ISO 8601 with the user timezone offset.', {
    title: { type: 'string' },
    space: { type: 'string', enum: SPACES },
    start: { type: 'string', description: 'ISO start' },
    end: { type: 'string', description: 'ISO end' },
    is_meeting: { type: 'boolean', description: 'true if it is a meeting' },
    notes: { type: 'string' }
  }, ['title', 'start', 'end']),
  tool('list_events', 'List events between two ISO times.', { from: { type: 'string' }, to: { type: 'string' } }, ['from', 'to']),
  tool('update_event', 'Change an event by id.', {
    id: { type: 'string' },
    title: { type: 'string' },
    start: { type: 'string' },
    end: { type: 'string' },
    space: { type: 'string', enum: SPACES },
    is_meeting: { type: 'boolean' }
  }, ['id']),
  tool('delete_event', 'Delete an event by id.', { id: { type: 'string' } }, ['id']),
  tool('add_task', 'Add a to-do.', { title: { type: 'string' } }, ['title']),
  tool('list_tasks', 'List to-dos.', {}, [])
];

function systemPrompt(now, timezone) {
  return "You are Layana's personal assistant inside her private Life OS. She writes English or Jordanian Arabic: reply in the language she used. Be brief and warm.\n" +
    'Current time: ' + now + ' (timezone ' + timezone + ', UTC+03:00). Weeks start on Monday.\n' +
    'Use the tools to really create, change or delete events and tasks, never pretend. Resolve relative times ("tomorrow at 3") against the current time and send ISO strings with the +03:00 offset. Default length 1 hour. Space: Business for work and clients, Lensiyana for content, otherwise Personal.\n' +
    'For meetings set is_meeting true. Google Calendar is not connected yet, so there is no Google Meet link: say plainly that the meeting is saved in Life OS and the link will come once Google is connected. If a time is unclear, ask one short question. To edit or delete, list events first to find the id.';
}

var server = {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method === 'GET') {
      return json(req, { ok: true, gateway: !!env('AI_GATEWAY_TOKEN'), passcode: !!env('ASSISTANT_PASSCODE') });
    }
    if (!passOk(req.headers.get('x-passcode'))) return json(req, { error: 'Wrong passcode' }, 401);
    try {
      var input = await req.json();
      var now = input.now || new Date().toISOString();
      var timezone = input.timezone || 'Asia/Amman';
      var messages = (input.messages || []).slice(-40);
      var convo = [{ role: 'system', content: systemPrompt(now, timezone) }].concat(messages);
      var r = await fetch(env('NEON_AI_GATEWAY_BASE_URL', GATEWAY) + '/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + env('AI_GATEWAY_TOKEN') },
        body: JSON.stringify({ model: env('MODEL', 'claude-sonnet-4-6'), messages: convo, tools: TOOLS, max_tokens: 1024 })
      });
      var text = await r.text();
      if (!r.ok) return json(req, { error: 'AI gateway ' + r.status + ': ' + text.slice(0, 300) }, 502);
      var data = JSON.parse(text);
      return json(req, { message: data.choices[0].message });
    } catch (e) {
      return json(req, { error: String(e.message || e) }, 500);
    }
  }
};

export default server;
