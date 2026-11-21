import { createAuthClient } from '@neondatabase/auth';

/** Public endpoints of the "lifeos" Neon project (safe to ship to the browser). */
export const AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ??
  'https://ep-bitter-pond-b9ujp2cs.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth';
export const DATA_URL =
  import.meta.env.VITE_NEON_DATA_URL ??
  'https://ep-bitter-pond-b9ujp2cs.apirest.c-7.eu-central-1.aws.neon.tech/neondb/rest/v1';

export const authClient = createAuthClient(AUTH_URL);

async function token(): Promise<string> {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error('Not signed in');
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
