import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Badge, Card, Eyebrow, Toggle } from '../components/ui';
import { cn } from '../lib/cn';
import { permissions, standingApprovals } from '../data/mock';

type Message = { from: 'you' | 'assistant'; text: string };

const CANNED =
  'Here is a draft plan for today. Nothing has been changed yet; tell me what to approve and I will do it within your permissions.';

export default function Assistant() {
  const location = useLocation() as { state?: { prompt?: string } };
  const [messages, setMessages] = useState<Message[]>([
    { from: 'assistant', text: 'Hi Layana. What should we organize first?' },
  ]);
  const [draft, setDraft] = useState('');
  const [approvals, setApprovals] = useState<boolean[]>(standingApprovals.map((_, i) => i === 0));
  const endRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  function send(text: string) {
    setMessages((m) => [...m, { from: 'you', text }]);
    window.setTimeout(() => setMessages((m) => [...m, { from: 'assistant', text: CANNED }]), 500);
  }

  useEffect(() => {
    const initial = location.state?.prompt;
    if (initial && !seeded.current) {
      seeded.current = true;
      send(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    send(draft.trim());
    setDraft('');
  }

  return (
    <>
      <PageHeader eyebrow="Assistant" title="AI Assistant" />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:gap-7">
        <Card className="flex min-h-[420px] flex-col gap-3">
          <div className="flex flex-1 flex-col gap-3" aria-live="polite">
            {messages.map((m, i) => (
              <p
                key={i}
                className={cn(
                  'm-0 max-w-[85%] rounded-lg px-4 py-3 text-sm',
                  m.from === 'you' ? 'self-end bg-accent text-white' : 'self-start bg-soft text-ink',
                )}
              >
                {m.text}
              </p>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Message"
              placeholder="Message your assistant…"
              className="h-12 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 text-sm outline-none placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
            <button
              type="submit"
              aria-label="Send"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover"
            >
              <Send size={18} aria-hidden />
            </button>
          </form>
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
                  <Toggle
                    label={label}
                    checked={approvals[i]}
                    onChange={(v) => setApprovals((prev) => prev.map((x, j) => (j === i ? v : x)))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
