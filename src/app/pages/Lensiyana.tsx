import { PageHeader } from '../components/AppShell';
import { Badge, Button, Card, Eyebrow, SectionTitle } from '../components/ui';
import { EventRow } from '../components/rows';
import { lensiyanaPosts, pipeline } from '../data/mock';

export default function Lensiyana() {
  return (
    <>
      <PageHeader eyebrow="Space" title="Lensiyana">
        <Button plus className="hidden lg:inline-flex">
          New idea
        </Button>
      </PageHeader>

      <section aria-label="Content pipeline" className="flex flex-col gap-3">
        <SectionTitle title="Content pipeline" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((col) => (
            <div key={col.column} className="flex flex-col gap-3 rounded-xl border border-line-subtle bg-soft p-3">
              <div className="flex items-center justify-between px-1">
                <Eyebrow>{col.column}</Eyebrow>
                <span className="text-xs text-ink-3">{col.count}</span>
              </div>
              {col.cards.map((card) => (
                <Card key={card.title} className="flex flex-col gap-2 p-3 lg:p-3">
                  <span className="text-sm font-medium text-ink">{card.title}</span>
                  <span>
                    <Badge tone={card.tone}>{card.type}</Badge>
                  </span>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Card className="flex flex-col gap-2">
        <SectionTitle title="Scheduled posts" />
        {lensiyanaPosts.map((p) => (
          <EventRow key={p.title} {...p} />
        ))}
      </Card>
    </>
  );
}
