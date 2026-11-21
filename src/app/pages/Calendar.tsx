import { useState } from 'react';
import { PageHeader } from '../components/AppShell';
import { Button, Card, Chip } from '../components/ui';
import { cn } from '../lib/cn';
import {
  calendarEvents,
  formatHour,
  SPACE_DOT,
  SPACE_STYLE,
  TODAY_INDEX,
  WEEK_START,
  type Space,
} from '../data/mock';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const ROW = 56; // px per hour
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
const FILTERS: (Space | 'All')[] = ['All', 'Personal', 'Business', 'Lensiyana'];

export default function Calendar() {
  const [filter, setFilter] = useState<Space | 'All'>('All');
  const [selected, setSelected] = useState(TODAY_INDEX);

  const events = calendarEvents.filter((e) => filter === 'All' || e.space === filter);
  const agenda = events.filter((e) => e.day === selected).sort((a, b) => a.start - b.start);

  return (
    <>
      <PageHeader eyebrow="16 – 22 November 2026" title="Calendar">
        <Button plus className="hidden lg:inline-flex">
          New event
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {/* Desktop week grid */}
      <Card className="hidden overflow-hidden p-0 lg:block lg:p-0">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-line-subtle">
          <div />
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn('py-3 text-center text-[13px] font-medium', i === TODAY_INDEX ? 'text-accent' : 'text-ink-2')}
            >
              {d} {WEEK_START + i}
            </div>
          ))}
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
            <div
              key={d}
              className={cn('relative border-l border-line-subtle', day === TODAY_INDEX && 'bg-accent-faint')}
            >
              {HOURS.map((h) => (
                <div key={h} className="border-b border-line-subtle" style={{ height: ROW }} />
              ))}
              {events
                .filter((e) => e.day === day)
                .map((e) => (
                  <div
                    key={`${e.day}-${e.start}-${e.title}`}
                    className={cn('absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 text-xs font-medium', SPACE_STYLE[e.space])}
                    style={{ top: (e.start - FIRST_HOUR) * ROW, height: e.duration * ROW - 2 }}
                    title={`${e.title} · ${formatHour(e.start)}`}
                  >
                    {e.title}
                  </div>
                ))}
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
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs',
                selected === i ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-2',
              )}
            >
              <span>{d}</span>
              <span className="font-heading text-base">{WEEK_START + i}</span>
            </button>
          ))}
        </div>
        <Card className="flex flex-col divide-y divide-line-subtle">
          {agenda.length === 0 && <p className="m-0 py-3 text-sm text-ink-2">Nothing scheduled.</p>}
          {agenda.map((e) => (
            <div key={`${e.start}-${e.title}`} className="flex items-center gap-3 py-3">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', SPACE_DOT[e.space])} aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-ink">{e.title}</span>
                <span className="text-xs text-ink-2">
                  {formatHour(e.start)} · {e.space}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
