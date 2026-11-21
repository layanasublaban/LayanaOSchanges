import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { Avatar, Badge, Card, Eyebrow, IconTile } from './ui';
import type { Tone, UpcomingEvent } from '../data/mock';

/* ---------- Checklist row ---------- */

export function ChecklistRow({
  label,
  meta,
  done,
  onToggle,
}: {
  label: string;
  meta?: string;
  done: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      className="flex w-full items-center gap-3 border-0 bg-transparent py-3 text-left"
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border',
          done ? 'border-accent bg-accent text-white' : 'border-line bg-surface',
        )}
      >
        {done && <Check size={14} strokeWidth={3} />}
      </span>
      <span className={cn('flex-1 text-sm', done ? 'text-ink-3' : 'text-ink')}>{label}</span>
      {meta && <span className="text-xs text-ink-3">{meta}</span>}
    </button>
  );
}

/* ---------- Event row ---------- */

export function EventRow({ day, month, title, time }: UpcomingEvent) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-accent-soft leading-none text-accent"
      >
        <span className="font-heading text-sm">{day}</span>
        <span className="mt-0.5 text-[10px] font-medium">{month}</span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-ink">{title}</span>
        <span className="text-xs text-ink-2">{time}</span>
      </span>
    </div>
  );
}

/* ---------- Space row (link) ---------- */

export function SpaceRow({
  to,
  title,
  meta,
  icon,
}: {
  to: string;
  title: string;
  meta: string;
  icon: ReactNode;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 py-3 text-ink no-underline">
      <IconTile>{icon}</IconTile>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-heading text-base">{title}</span>
        <span className="text-xs text-ink-2">{meta}</span>
      </span>
      <ChevronRight size={18} className="text-ink-3" aria-hidden />
    </Link>
  );
}

/* ---------- Generic list row ---------- */

export function ListRow({
  lead,
  title,
  meta,
  value,
  badge,
  tone = 'info',
}: {
  lead?: ReactNode;
  title: string;
  meta?: string;
  value?: string;
  badge?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      {lead}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-heading text-base text-ink">{title}</span>
        {meta && <span className="text-xs text-ink-2">{meta}</span>}
      </div>
      {value && <span className="text-[13px] font-medium text-ink">{value}</span>}
      {badge && <Badge tone={tone}>{badge}</Badge>}
    </div>
  );
}

export function InitialAvatar({ label }: { label: string }) {
  return <Avatar label={label} size={40} />;
}

/* ---------- Progress row (goals, projects, budgets) ---------- */

export function ProgressRow({ title, meta, pct }: { title: string; meta: string; pct: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-heading text-base text-ink">{title}</span>
          <span className="text-xs text-ink-2">{meta}</span>
        </div>
        <span className="text-[13px] font-medium text-accent">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={title}
        className="h-1.5 w-full overflow-hidden rounded-full bg-accent-soft"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------- Stat card ---------- */

export function StatCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <Card className="flex flex-col gap-1 p-4 lg:p-4">
      <span className="text-xs text-ink-2">{label}</span>
      <span className="font-heading text-[28px] leading-10 tracking-[-0.02em] text-ink lg:text-[34px]">
        {value}
      </span>
      <span className="text-xs text-ink-3">{caption}</span>
    </Card>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{children}</div>;
}

/* ---------- Card with eyebrow heading ---------- */

export function EyebrowCard({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('flex flex-col gap-1', className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      {children}
    </Card>
  );
}
