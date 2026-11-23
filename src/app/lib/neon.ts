/** Sign-in is switched off for now. Data is kept in this browser (see useTable.ts). */
export const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL ?? 'https://br-weathered-rain-b9s2ocjb-assistant.compute.c-7.eu-central-1.aws.neon.tech/';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** The cloud assistant needs a signed-in session, which is off for now. */
export async function askAssistant(_messages: ChatTurn[]): Promise<{ reply: string; actions: string[] }> {
  throw new Error('the cloud assistant is off until sign-in is switched back on');
}
