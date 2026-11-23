import { Heart, Sparkles, Wallet, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../components/AppShell';
import { Card } from '../components/ui';
import { SpaceRow } from '../components/rows';

export default function More() {
  return (
    <>
      <PageHeader eyebrow="Menu" title="More" />
      <Card className="divide-y divide-line-subtle py-1 lg:py-1">
        <SpaceRow to="/personal" title="Personal" meta="Habits, goals, weekend" icon={<Heart size={20} />} />
        <SpaceRow to="/lensiyana" title="Lensiyana" meta="Content pipeline" icon={<Sparkles size={20} />} />
        <SpaceRow to="/finance" title="Finance" meta="Cash flow and budgets" icon={<Wallet size={20} />} />
        <SpaceRow to="/settings" title="Settings" meta="Preferences and account" icon={<SlidersHorizontal size={20} />} />
      </Card>
    </>
  );
}
