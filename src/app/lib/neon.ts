/** Sign-in is switched off for now. Data is kept in this browser (see useTable.ts). */
export const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL ?? 'https://br-weathered-rain-b9s2ocjb-assistant.compute.c-7.eu-central-1.aws.neon.tech/';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

type Msg = { role: string; content?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[]; tool_call_id?: string };

const read = (t: string): any[] => {
  try {
    return JSON.parse(localStorage.getItem(`lifeos.${t}`) || '[]');
  } catch {
    return [];
  }
};
const write = (t: string, rows: any[]) => localStorage.setItem(`lifeos.${t}`, JSON.stringify(rows));
const uid = () => crypto.randomUUID();

/** Runs one assistant tool against this browser's events and tasks. */
function runTool(name: string, a: any): unknown {
  if (name === 'create_event') {
    const row = {
      id: uid(), title: a.title, space: a.space || 'Business', starts_at: a.start, ends_at: a.end,
      is_meeting: !!a.is_meeting, notes: a.notes ?? null, meet_url: null, created_at: new Date().toISOString(),
    };
    write('events', [...read('events'), row]);
    return { created: row.id, title: row.title, google_meet: 'not connected yet' };
  }
  if (name === 'list_events') {
    return read('events')
      .filter((e) => e.starts_at >= a.from && e.starts_at <= a.to)
      .sort((x, y) => (x.starts_at < y.starts_at ? -1 : 1))
      .map(({ id, title, space, starts_at, ends_at, is_meeting }) => ({ id, title, space, starts_at, ends_at, is_meeting }));
  }
  if (name === 'update_event') {
    let n = 0;
    write('events', read('events').map((e) => {
      if (e.id !== a.id) return e;
      n++;
      const patch: any = {};
      for (const k of ['title', 'space', 'is_meeting']) if (a[k] !== undefined) patch[k] = a[k];
      if (a.start) patch.starts_at = a.start;
      if (a.end) patch.ends_at = a.end;
      return { ...e, ...patch };
    }));
    return { updated: n };
  }
  if (name === 'delete_event') {
    write('events', read('events').filter((e) => e.id !== a.id));
    return { deleted: true };
  }
  if (name === 'add_task') {
    const row = { id: uid(), title: a.title, done: false, created_at: new Date().toISOString() };
    write('tasks', [...read('tasks'), row]);
    return { created: row.id };
  }
  if (name === 'list_tasks') return read('tasks').map(({ id, title, done }) => ({ id, title, done }));
  return { error: 'unknown tool' };
}

function passcode(): string {
  let p = localStorage.getItem('lifeos.passcode') || '';
  if (!p) {
    p = (window.prompt('Enter your assistant passcode') || '').trim();
    if (p) localStorage.setItem('lifeos.passcode', p);
  }
  return p;
}

/** Asks the cloud AI; the AI asks for tools, this browser runs them and sends the results back. */
export async function askAssistant(turns: ChatTurn[]): Promise<{ reply: string; actions: string[] }> {
  const code = passcode();
  if (!code) throw new Error('a passcode is needed');
  const convo: Msg[] = turns.map((t) => ({ role: t.role, content: t.content }));
  const actions: string[] = [];
  for (let i = 0; i < 6; i++) {
    const res = await fetch(ASSISTANT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': code },
      body: JSON.stringify({ messages: convo, now: new Date().toString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem('lifeos.passcode');
      throw new Error('wrong passcode, try again');
    }
    if (!res.ok) throw new Error(body.error ?? `assistant error ${res.status}`);
    const msg: Msg = body.message;
    convo.push(msg);
    if (!msg.tool_calls?.length) return { reply: msg.content || '', actions };
    for (const call of msg.tool_calls) {
      let out: unknown;
      try {
        out = runTool(call.function.name, JSON.parse(call.function.arguments || '{}'));
        if (!call.function.name.startsWith('list_')) actions.push(call.function.name);
      } catch (e) {
        out = { error: String(e instanceof Error ? e.message : e) };
      }
      convo.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(out) });
    }
  }
  return { reply: 'I could not finish that. Please try again.', actions };
}
