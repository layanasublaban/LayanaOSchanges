import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Send, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Card, Chip, Eyebrow, ProgressBar, SectionTitle } from '../components/ui';
import { ChecklistRow, EventRow, SpaceRow } from '../components/rows';
import { priorities, spaces, upcoming, type Task } from '../data/mock';

const ICONS = { personal: Heart, business: Briefcase, lensiyana: Sparkles } as const;
const SUGGESTIONS = ['Plan my day', 'Draft a client reply', 'Schedule a post'];

export default function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState<Task[]>(priorities);

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  function ask(text: string) {
    navigate('/assistant', { state: { prompt: text } });
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (prompt.trim()) ask(prompt.trim());
  }

  return (
    <>
      <PageHeader eyebrow="Friday, 20 November" title="Good evening, Layana" />

      <Card tone="hero" className="flex flex-col gap-4">
        <Eyebrow>AI Assistant</Eyebrow>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Ask your assistant"
            placeholder="Ask anything about your day…"
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
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} onClick={() => ask(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-7">
        <Card className="flex flex-col gap-3">
          <SectionTitle title="Today's focus" />
          <div className="flex items-center gap-3">
            <ProgressBar value={pct} label="Today's progress" />
            <span className="whitespace-nowrap text-xs text-ink-2">
              {doneCount} of {tasks.length}
            </span>
          </div>
          <div className="divide-y divide-line-subtle">
            {tasks.map((t) => (
              <ChecklistRow
                key={t.id}
                label={t.label}
                meta={t.meta}
                done={t.done}
                onToggle={() =>
                  setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
                }
              />
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:gap-7">
          <Card className="flex flex-col gap-2">
            <SectionTitle title="Next up" action="Calendar" onAction={() => navigate('/calendar')} />
            {upcoming.map((e) => (
              <EventRow key={e.title} {...e} />
            ))}
          </Card>
          <Card className="flex flex-col">
            <SectionTitle title="Your spaces" />
            <div className="divide-y divide-line-subtle">
              {spaces.map((s) => {
                const Icon = ICONS[s.key];
                return <SpaceRow key={s.key} to={s.to} title={s.title} meta={s.meta} icon={<Icon size={20} />} />;
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
