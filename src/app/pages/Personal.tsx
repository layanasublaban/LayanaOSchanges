import { useState } from 'react';
import { PageHeader } from '../components/AppShell';
import { Card, ProgressBar, SectionTitle, SampleNote } from '../components/ui';
import { ChecklistRow, EventRow, ProgressRow } from '../components/rows';
import { goals, habits, weekendPersonal, type Task } from '../data/mock';

export default function Personal() {
  const [items, setItems] = useState<Task[]>(habits);
  const done = items.filter((h) => h.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <>
      <PageHeader eyebrow="Space" title="Personal" />
      <SampleNote />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-7">
        <Card className="flex flex-col gap-3">
          <SectionTitle title="Habits today" />
          <div className="flex items-center gap-3">
            <ProgressBar value={pct} label="Habits completed" />
            <span className="whitespace-nowrap text-xs text-ink-2">
              {done} of {items.length}
            </span>
          </div>
          <div className="divide-y divide-line-subtle">
            {items.map((h) => (
              <ChecklistRow
                key={h.id}
                label={h.label}
                meta={h.meta}
                done={h.done}
                onToggle={() => setItems((prev) => prev.map((x) => (x.id === h.id ? { ...x, done: !x.done } : x)))}
              />
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-5 lg:gap-7">
          <Card className="flex flex-col gap-4">
            <SectionTitle title="Goals" />
            {goals.map((g) => (
              <ProgressRow key={g.title} {...g} />
            ))}
          </Card>
          <Card className="flex flex-col gap-2">
            <SectionTitle title="This weekend" />
            {weekendPersonal.map((e) => (
              <EventRow key={e.title} {...e} />
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
