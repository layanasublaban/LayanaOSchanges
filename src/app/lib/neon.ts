import { createAuthClient } from '@neondatabase/auth';

/** Public endpoints of the "lifeos" Neon project (safe to ship to the browser). */
export const AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ??
  'https://ep-bitter-pond-b9ujp2cs.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth';
export const DATA_URL =
  import.meta.env.VITE_NEON_DATA_URL ??
  'https://ep-bitter-pond-b9ujp2cs.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1';

export const authClient = createAuthClient(AUTH_URL, { fetchOptions: { credentials: 'include' } });

async function token(): Promise<string> {
  // Prefer the JWT the session already carries; fall back to the token endpoint.
  const sess = await authClient.getSession();
  const fromSession = (sess.data as { session?: { token?: string } } | null)?.session?.token;
  if (fromSession && fromSession.split('.').length === 3) return fromSession;
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error('Not signed in (no token from Neon Auth)');
  return data.token;
}

/** Calls the Neon Data API with the signed-in user's JWT. Row-level security limits it to the owner. */
export async function rest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${DATA_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await token()}`,
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL ?? 'https://br-weathered-rain-b9s2ocjb-assistant.compute.c-7.eu-central-1.aws.neon.tech/';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** Sends the conversation to the assistant function, which can create/edit events and tasks for real. */
export async function askAssistant(messages: ChatTurn[]): Promise<{ reply: string; actions: string[] }> {
  const res = await fetch(ASSISTANT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
    body: JSON.stringify({ messages, now: new Date().toString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Assistant error ${res.status}`);
  return body;
}
