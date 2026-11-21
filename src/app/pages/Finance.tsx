import { PageHeader } from '../components/AppShell';
import { Card, SectionTitle } from '../components/ui';
import { ListRow, ProgressRow, StatCard, StatGrid } from '../components/rows';
import { budgets, cashFlow, transactions } from '../data/mock';

const MAX = Math.max(...cashFlow.flatMap((c) => [c.income, c.expenses]));

export default function Finance() {
  return (
    <>
      <PageHeader eyebrow="Manage" title="Finance" />

      <StatGrid>
        <StatCard label="Income" value="$6,400" caption="November" />
        <StatCard label="Expenses" value="$2,100" caption="November" />
        <StatCard label="Net" value="$4,300" caption="+12% vs October" />
        <StatCard label="Outstanding" value="$2,450" caption="2 invoices" />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-7">
        <Card className="flex flex-col gap-4">
          <SectionTitle title="Cash flow" />
          <div className="flex h-48 items-end gap-3" role="img" aria-label="Income and expenses, June to November">
            {cashFlow.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end justify-center gap-1">
                  <div className="w-1/3 rounded-t-sm bg-accent" style={{ height: `${(m.income / MAX) * 100}%` }} />
                  <div className="w-1/3 rounded-t-sm bg-accent-soft" style={{ height: `${(m.expenses / MAX) * 100}%` }} />
                </div>
                <span className="text-xs text-ink-3">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden /> Income
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent-soft" aria-hidden /> Expenses
            </span>
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <SectionTitle title="Budgets" />
          {budgets.map((b) => (
            <ProgressRow key={b.title} {...b} />
          ))}
        </Card>
      </div>

      <Card className="flex flex-col">
        <SectionTitle title="Recent transactions" />
        <div className="divide-y divide-line-subtle">
          {transactions.map((t) => (
            <ListRow key={t.title} title={t.title} meta={t.meta} value={t.value} badge={t.badge} tone={t.tone} />
          ))}
        </div>
      </Card>
    </>
  );
}
