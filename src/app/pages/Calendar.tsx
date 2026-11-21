import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Trash2, Video } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Badge, Button, Card, Chip, Field, SectionTitle } from '../components/ui';
import { cn } from '../lib/cn';
import { useTable } from '../lib/useTable';
import { formatHour, SPACE_DOT, SPACE_STYLE, type Space } from '../data/mock';

type EventRow = {
  id: string;
  title: string;
  space: Space;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  meet_url: string | null;
  is_meeting: boolean;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FIRST_HOUR = 7;
const LAST_HOUR = 22;
const ROW = 56;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
const FILTERS: (Space | 'All' | 'Meetings')[] = ['All', 'Personal', 'Business', 'Lensiyana', 'Meetings'];

const mondayOf = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const decimalHour = (d: Date) => d.getHours() + d.getMinutes() / 60;
const pad = (n: number) => String(n).padStart(2, '0');
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Calendar() {
  const { rows, loading, error, add, update, remove } = useTable<EventRow>('events', 'select=*&order=starts_at.asc');
  const [filter, setFilter] = useState<Space | 'All' | 'Meetings'>('All');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState((new Date().getDay() + 6) % 7);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const startEdit = (e: EventRow) => {
    setOpen(false);
    setEditing(e);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const monday = useMemo(() => {
    const m = mondayOf(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const todayKey = toDateInput(new Date());

  const events = rows
    .filter((e) => (filter === 'All' ? true : filter === 'Meetings' ? e.is_meeting : e.space === filter))
    .map((e) => ({ ...e, start: new Date(e.starts_at), end: new Date(e.ends_at) }));
  const inWeek = (day: number) =>
    events.filter((e) => toDateInput(e.start) === toDateInput(new Date(monday.getTime() + day * 86400000)));
  const agenda = inWeek(selected);
  const meetings = rows.filter((e) => e.is_meeting && new Date(e.ends_at) >= new Date()).slice(0, 5);

  const label = `${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <>
      <PageHeader eyebrow={label} title="Calendar">
        <Button plus onClick={() => { setEditing(null); setOpen((o) => !o); }}>
          <span className="hidden sm:inline">New event</span><span className="sm:hidden">New</span>
        </Button>
      </PageHeader>

      {(open || editing) && (
        <div ref={formRef}>
          <EventForm
            key={editing?.id ?? 'new'}
            initial={editing}
            defaultDate={toDateInput(new Date(monday.getTime() + selected * 86400000))}
            onCancel={() => { setOpen(false); setEditing(null); }}
            onDelete={editing ? async () => { await remove(editing.id); setEditing(null); } : undefined}
            onSave={async (v) => {
              if (editing) await update(editing.id, v);
              else await add(v);
              setOpen(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
        <span className="flex w-full justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <Button variant="secondary" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
            ‹
          </Button>
          <Button variant="secondary" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="secondary" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
            ›
          </Button>
        </span>
      </div>

      {error && <p role="alert" className="m-0 rounded-md bg-danger-bg px-3 py-2 text-[13px] text-danger-fg">{error}</p>}

      {/* Desktop week grid */}
      <Card className="hidden overflow-hidden p-0 lg:block lg:p-0">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-line-subtle">
          <div />
          {DAYS.map((d, i) => {
            const date = new Date(monday.getTime() + i * 86400000);
            return (
              <div key={d} className={cn('py-3 text-center text-[13px] font-medium', toDateInput(date) === todayKey ? 'text-accent' : 'text-ink-2')}>
                {d} {date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]" style={{ height: HOURS.length * ROW }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="pr-2 text-right text-xs text-ink-3" style={{ height: ROW }}>
                {formatHour(h).replace(':00', '')}
              </div>
            ))}
          </div>
          {DAYS.map((d, day) => (
            <div key={d} className={cn('relative border-l border-line-subtle', toDateInput(new Date(monday.getTime() + day * 86400000)) === todayKey && 'bg-accent-faint')}>
              {HOURS.map((h) => (
                <div key={h} className="border-b border-line-subtle" style={{ height: ROW }} />
              ))}
              {inWeek(day).map((e) => {
                const start = Math.max(decimalHour(e.start), FIRST_HOUR);
                const dur = Math.max((e.end.getTime() - e.start.getTime()) / 3600000, 0.5);
                return (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => startEdit(e)}
                    className={cn('absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border-0 px-2 py-1 text-left text-xs font-medium', SPACE_STYLE[e.space])}
                    style={{ top: (start - FIRST_HOUR) * ROW, height: dur * ROW - 2 }}
                    title={`${e.title} · ${formatHour(decimalHour(e.start))}`}
                  >
                    {e.is_meeting && <Video size={11} className="mr-1 inline" aria-hidden />}
                    {e.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile week strip + agenda */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Days">
          {DAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={selected === i}
              onClick={() => setSelected(i)}
              className={cn('flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs', selected === i ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-2')}
            >
              <span>{d}</span>
              <span className="font-heading text-base">{new Date(monday.getTime() + i * 86400000).getDate()}</span>
            </button>
          ))}
        </div>
        <Card className="flex flex-col divide-y divide-line-subtle">
          {loading && <p className="m-0 py-3 text-sm text-ink-2">Loading…</p>}
          {!loading && agenda.length === 0 && <p className="m-0 py-3 text-sm text-ink-2">Nothing scheduled.</p>}
          {agenda.map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-3">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', SPACE_DOT[e.space])} aria-hidden />
              <button type="button" onClick={() => startEdit(e)} className="flex min-w-0 flex-1 flex-col border-0 bg-transparent p-0 text-left">
                <span className="text-sm font-medium text-ink">{e.title}</span>
                <span className="text-xs text-ink-2">{formatHour(decimalHour(e.start))} · {e.space}{e.is_meeting ? ' · Meeting' : ''}</span>
              </button>
              <button type="button" aria-label={`Delete ${e.title}`} onClick={() => void remove(e.id)} className="border-0 bg-transparent text-ink-3">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <SectionTitle title="Upcoming meetings" />
        {meetings.length === 0 && <p className="m-0 text-sm text-ink-2">No meetings yet. Create an event and turn on “Meeting”.</p>}
        {meetings.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2">
            <Video size={18} className="text-accent" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-ink">{m.title}</span>
              <span className="text-xs text-ink-2">
                {new Date(m.starts_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button type="button" onClick={() => startEdit(m)} className="border-0 bg-transparent text-[13px] font-medium text-ink-2">Edit</button>
            {m.meet_url ? (
              <a href={m.meet_url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-accent">Join</a>
            ) : (
              <Badge tone="warning">Meet link pending</Badge>
            )}
          </div>
        ))}
      </Card>
    </>
  );
}

const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function EventForm({
  initial,
  defaultDate,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: EventRow | null;
  defaultDate: string;
  onSave: (v: Partial<EventRow>) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [space, setSpace] = useState<Space>(initial?.space ?? 'Business');
  const [date, setDate] = useState(initial ? toDateInput(new Date(initial.starts_at)) : defaultDate);
  const [start, setStart] = useState(initial ? hhmm(initial.starts_at) : '10:00');
  const [end, setEnd] = useState(initial ? hhmm(initial.ends_at) : '11:00');
  const [meeting, setMeeting] = useState(initial?.is_meeting ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [problem, setProblem] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const s = new Date(`${date}T${start}`);
    const en = new Date(`${date}T${end}`);
    if (!title.trim()) return setProblem('Give the event a title.');
    if (en <= s) return setProblem('End time must be after the start time.');
    try {
      await onSave({ title: title.trim(), space, starts_at: s.toISOString(), ends_at: en.toISOString(), is_meeting: meeting });
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'Could not save.');
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-[18px] leading-6">{initial ? 'Edit event' : 'New event'}</h2>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field className="sm:col-span-2" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Client call with…" />
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">Space</span>
          <select value={space} onChange={(e) => setSpace(e.target.value as Space)} className="h-12 rounded-lg border border-line bg-surface px-3 text-sm">
            <option>Personal</option>
            <option>Business</option>
            <option>Lensiyana</option>
          </select>
        </label>
        <Field label="Starts" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Field label="Ends" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={meeting} onChange={(e) => setMeeting(e.target.checked)} />
          This is a meeting (Google Meet link is added once Google Calendar is connected)
        </label>
        {problem && <p role="alert" className="m-0 text-[13px] text-danger-fg sm:col-span-2">{problem}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit">{initial ? 'Save changes' : 'Save event'}</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          {onDelete && !confirmDelete && (
            <Button variant="ghost" className="ml-auto text-danger-fg" onClick={() => setConfirmDelete(true)}>Delete</Button>
          )}
          {onDelete && confirmDelete && (
            <Button variant="ghost" className="ml-auto bg-danger-bg text-danger-fg" onClick={() => void onDelete()}>Confirm delete</Button>
          )}
        </div>
      </form>
    </Card>
  );
}
