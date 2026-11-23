import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Mic, Send, Square, Volume2, VolumeX } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Badge, Card, Eyebrow, Toggle } from '../components/ui';
import { cn } from '../lib/cn';
import { askAssistant, type ChatTurn } from '../lib/neon';
import { useVoice } from '../lib/useVoice';
import { permissions, standingApprovals } from '../data/mock';

const GREETING: ChatTurn = {
  role: 'assistant',
  content: 'Hi Layana. Tell me what to schedule, add or change, by typing or with the microphone.',
};
const ACTION_LABEL: Record<string, string> = {
  create_event: 'Event created',
  update_event: 'Event updated',
  delete_event: 'Event deleted',
  add_task: 'Task added',
};

export default function Assistant() {
  const location = useLocation() as { state?: { prompt?: string } };
  const [messages, setMessages] = useState<ChatTurn[]>([GREETING]);
  const [badges, setBadges] = useState<Record<number, string[]>>({});
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [approvals, setApprovals] = useState<boolean[]>(standingApprovals.map((_, i) => i === 0));
  const endRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const history = useRef<ChatTurn[]>([]);

  const voice = useVoice((text) => void send(text));

  async function save(turn: ChatTurn) {
    try {
      const old = JSON.parse(localStorage.getItem('lifeos.chat') || '[]');
      localStorage.setItem('lifeos.chat', JSON.stringify([...old, turn].slice(-40)));
    } catch {
      /* history is a convenience; never block the chat */
    }
  }

  async function send(text: string) {
    if (busy || !text.trim()) return;
    const user: ChatTurn = { role: 'user', content: text.trim() };
    const next = [...history.current, user];
    history.current = next;
    setMessages((m) => [...m, user]);
    setBusy(true);
    void save(user);
    try {
      const { reply, actions } = await askAssistant(next.slice(-20));
      const bot: ChatTurn = { role: 'assistant', content: reply || 'Done.' };
      history.current = [...next, bot];
      setMessages((m) => {
        if (actions.length) setBadges((b) => ({ ...b, [m.length]: [...new Set(actions)] }));
        return [...m, bot];
      });
      void save(bot);
      if (speak && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(bot.content);
        u.lang = voice.lang;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `I could not reach the assistant (${e instanceof Error ? e.message : 'error'}). Please try again.` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const old = (JSON.parse(localStorage.getItem('lifeos.chat') || '[]') as ChatTurn[]).slice(-20);
        history.current = old;
        if (old.length) setMessages([GREETING, ...old]);
      } catch {
        /* start fresh */
      }
      const initial = location.state?.prompt;
      if (initial && !seeded.current) {
        seeded.current = true;
        void send(initial);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy, voice.interim]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
    setDraft('');
  }

  return (
    <>
      <PageHeader eyebrow="Assistant" title="AI Assistant" />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:gap-7">
        <Card className="flex min-h-[460px] flex-col gap-3">
          <div className="flex flex-1 flex-col gap-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex max-w-[85%] flex-col gap-1.5', m.role === 'user' ? 'self-end items-end' : 'self-start')}>
                <p
                  dir="auto"
                  className={cn('m-0 whitespace-pre-wrap rounded-lg px-4 py-3 text-sm', m.role === 'user' ? 'bg-accent text-white' : 'bg-soft text-ink')}
                >
                  {m.content}
                </p>
                {badges[i]?.map((a) => (
                  <Badge key={a} tone="success">{ACTION_LABEL[a] ?? a}</Badge>
                ))}
              </div>
            ))}
            {busy && <p className="m-0 self-start rounded-lg bg-soft px-4 py-3 text-sm text-ink-3">Working on it…</p>}
            {voice.listening && (
              <p dir="auto" className="m-0 self-end rounded-lg border border-accent bg-accent-faint px-4 py-3 text-sm text-ink">
                {voice.interim || 'Listening…'}
              </p>
            )}
            <div ref={endRef} />
          </div>

          {voice.error && <p role="alert" className="m-0 text-[13px] text-danger-fg">{voice.error}</p>}

          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              dir="auto"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Message"
              placeholder={voice.listening ? 'Listening…' : 'Message your assistant…'}
              className="h-12 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 text-sm outline-none placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
            {voice.supported && (
              <button
                type="button"
                onClick={voice.listening ? voice.stop : voice.start}
                aria-label={voice.listening ? 'Stop listening' : 'Speak'}
                aria-pressed={voice.listening}
                className={cn(
                  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border',
                  voice.listening ? 'border-danger-fg bg-danger-bg text-danger-fg' : 'border-line bg-surface text-ink-2 hover:bg-soft',
                )}
              >
                {voice.listening ? <Square size={18} aria-hidden /> : <Mic size={18} aria-hidden />}
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              aria-label="Send"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
            >
              <Send size={18} aria-hidden />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-2">
            {voice.supported ? (
              <>
                <span>Voice language</span>
                <button type="button" onClick={() => voice.setLang('en-US')} aria-pressed={voice.lang === 'en-US'} className={cn('rounded-full border px-3 py-1', voice.lang === 'en-US' ? 'border-accent bg-accent-soft text-accent' : 'border-line')}>English</button>
                <button type="button" onClick={() => voice.setLang('ar-JO')} aria-pressed={voice.lang === 'ar-JO'} className={cn('rounded-full border px-3 py-1', voice.lang === 'ar-JO' ? 'border-accent bg-accent-soft text-accent' : 'border-line')}>العربية</button>
                <button type="button" onClick={() => setSpeak((s) => !s)} aria-pressed={speak} className="ml-auto inline-flex items-center gap-1.5 border-0 bg-transparent text-ink-2">
                  {speak ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />} Read replies aloud
                </button>
              </>
            ) : (
              <span>Voice input is not supported in this browser. Try Chrome or Safari.</span>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:gap-7">
          <Card className="flex flex-col gap-2">
            <Eyebrow>Permissions</Eyebrow>
            <div className="divide-y divide-line-subtle">
              {permissions.map((p) => (
                <div key={p.space} className="flex items-center justify-between py-3">
                  <span className="text-sm text-ink">{p.space}</span>
                  <Badge tone={p.tone}>{p.level}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-2">
            <Eyebrow>Standing approvals</Eyebrow>
            <div className="divide-y divide-line-subtle">
              {standingApprovals.map((label, i) => (
                <div key={label} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm text-ink">{label}</span>
                  <Toggle label={label} checked={approvals[i]} onChange={(v) => setApprovals((prev) => prev.map((x, j) => (j === i ? v : x)))} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
