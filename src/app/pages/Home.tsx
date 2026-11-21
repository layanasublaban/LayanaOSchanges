import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Send, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Card, Chip, Eyebrow, ProgressBar, SectionTitle } from '../components/ui';
import { ChecklistRow, EventRow, SpaceRow } from '../components/rows';
import { useTable } from '../lib/useTable';
import { spaces } from '../data/mock';

const ICONS = { personal: Heart, business: Briefcase, lensiyana: Sparkles } as const;
const SUGGESTIONS = ['Plan my day', 'Draft a client reply', 'Schedule a post'];

type TaskRow = { id: string; title: string; due_at: string | null; done: boolean };
type EventRowLite = { id: string; title: string; starts_at: string };

export default function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [newTask, setNewTask] = useState('');
  const tasks = useTable<TaskRow>('tasks', 'select=*&order=created_at.asc');
  const events = useTable<EventRowLite>('events', `select=id,title,starts_at&starts_at=gte.${new Date().toISOString()}&order=starts_at.asc&limit=3`);

  const doneCount = tasks.rows.filter((t) => t.done).length;
  const pct = tasks.rows.length ? Math.round((doneCount / tasks.rows.length) * 100) : 0;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const ask = (text: string) => navigate('/assistant', { state: { prompt: text } });

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await tasks.add({ title: newTask.trim() });
    setNewTask('');
  }

  return (
    <>
      <PageHeader eyebrow={today} title="Hello, Layana" />

      <Card tone="hero" className="flex flex-col gap-4">
        <Eyebrow>AI Assistant</Eyebrow>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) ask(prompt.trim());
          }}
          className="flex items-center gap-2"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Ask your assistant"
            placeholder="Ask anything about your day…"
            className="h-12 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 text-sm outline-none placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
          <button type="submit" aria-label="Send" className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover">
            <Send size={18} aria-hidden />
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} onClick={() => ask(s)}>{s}</Chip>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-7">
        <Card className="flex flex-col gap-3">
          <SectionTitle title="Today's focus" />
          <div className="flex items-center gap-3">
            <ProgressBar value={pct} label="Today's progress" />
            <span className="whitespace-nowrap text-xs text-ink-2">{doneCount} of {tasks.rows.length}</span>
          </div>
          {tasks.error && <p role="alert" className="m-0 text-[13px] text-danger-fg">{tasks.error}</p>}
          <div className="divide-y divide-line-subtle">
            {tasks.rows.map((t) => (
              <ChecklistRow key={t.id} label={t.title} done={t.done} onToggle={() => void tasks.update(t.id, { done: !t.done })} />
            ))}
            {!tasks.loading && tasks.rows.length === 0 && <p className="m-0 py-3 text-sm text-ink-2">No tasks yet. Add your first one.</p>}
          </div>
          <form onSubmit={addTask} className="flex gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              aria-label="New task"
              placeholder="Add a task…"
              className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
            />
            <button type="submit" className="h-11 rounded-lg bg-accent px-4 text-[13px] font-medium text-white">Add</button>
          </form>
        </Card>

        <div className="flex flex-col gap-5 lg:gap-7">
          <Card className="flex flex-col gap-2">
            <SectionTitle title="Next up" action="Calendar" onAction={() => navigate('/calendar')} />
            {events.rows.length === 0 && <p className="m-0 text-sm text-ink-2">Nothing scheduled.</p>}
            {events.rows.map((e) => {
              const d = new Date(e.starts_at);
              return (
                <EventRow
                  key={e.id}
                  day={String(d.getDate())}
                  month={d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                  title={e.title}
                  time={d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                />
              );
            })}
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
