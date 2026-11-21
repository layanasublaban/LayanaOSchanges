import { PageHeader } from '../components/AppShell';
import { Button, Card, SectionTitle } from '../components/ui';
import { InitialAvatar, ListRow, ProgressRow, StatCard, StatGrid } from '../components/rows';
import { clients, contracts, invoices, projects } from '../data/mock';

export default function Business() {
  return (
    <>
      <PageHeader eyebrow="Space" title="Business">
        <Button plus className="hidden lg:inline-flex">
          New client
        </Button>
      </PageHeader>

      <StatGrid>
        <StatCard label="Active clients" value="4" caption="2 new this month" />
        <StatCard label="Open proposals" value="1" caption="$8,200 pending" />
        <StatCard label="Outstanding" value="$2,450" caption="2 invoices" />
        <StatCard label="This month" value="$6,400" caption="Invoiced" />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
        <Card className="flex flex-col">
          <SectionTitle title="Clients" />
          <div className="divide-y divide-line-subtle">
            {clients.map((c) => (
              <ListRow
                key={c.name}
                lead={<InitialAvatar label={c.initial} />}
                title={c.name}
                meta={c.meta}
                value={c.value}
                badge={c.badge}
                tone={c.tone}
              />
            ))}
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <SectionTitle title="Projects" />
          {projects.map((p) => (
            <ProgressRow key={p.title} {...p} />
          ))}
        </Card>
        <Card className="flex flex-col">
          <SectionTitle title="Contracts" />
          <div className="divide-y divide-line-subtle">
            {contracts.map((c) => (
              <ListRow key={c.title} title={c.title} meta={c.meta} badge={c.badge} tone={c.tone} />
            ))}
          </div>
        </Card>
        <Card className="flex flex-col">
          <SectionTitle title="Invoices" />
          <div className="divide-y divide-line-subtle">
            {invoices.map((i) => (
              <ListRow key={i.title} title={i.title} meta={i.meta} value={i.value} badge={i.badge} tone={i.tone} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
