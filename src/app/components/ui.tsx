import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '../lib/cn';
import type { Tone } from '../data/mock';

/* ---------- Card ---------- */

export function Card({
  children,
  className,
  tone = 'surface',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'surface' | 'hero' | 'soft';
}) {
  return (
    <section
      className={cn(
        'rounded-xl border p-4 lg:p-6',
        tone === 'surface' && 'border-line-subtle bg-surface shadow-card',
        tone === 'hero' && 'border-accent-soft bg-hero',
        tone === 'soft' && 'border-line-subtle bg-soft',
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ---------- Typography helpers ---------- */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-3', className)}>
      {children}
    </p>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[22px] leading-[30px] text-ink">{title}</h2>
      {action && (
        <Button variant="ghost" icon onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}

/* ---------- Button ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: boolean;
  plus?: boolean;
  full?: boolean;
};

export function Button({
  variant = 'primary',
  icon,
  plus,
  full,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-medium transition-colors',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
        variant === 'secondary' && 'border border-line bg-surface text-ink hover:bg-soft',
        variant === 'ghost' && 'bg-transparent px-2 text-accent hover:bg-accent-faint',
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {plus && <Plus size={16} aria-hidden />}
      {children}
      {icon && <ArrowRight size={16} aria-hidden />}
    </button>
  );
}

/* ---------- Chip ---------- */

export function Chip({
  children,
  active,
  plus,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  plus?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
        active ? 'border-accent-soft bg-accent-soft text-accent' : 'border-line bg-surface text-ink hover:bg-soft',
      )}
    >
      {plus && <Plus size={14} aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */

const TONE: Record<Tone, string> = {
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
  info: 'bg-accent-soft text-accent',
};

export function Badge({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Avatar / icon tile ---------- */

export function Avatar({ label, size = 44 }: { label: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-heading text-base text-accent"
      style={{ width: size, height: size }}
    >
      {label}
    </span>
  );
}

export function IconTile({ children, size = 40 }: { children: ReactNode; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent"
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

/* ---------- Progress ---------- */

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-accent-soft"
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
  );
}

/* ---------- Text field ---------- */

export function Field({
  label,
  className,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <input
        className="h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent-soft"
        {...rest}
      />
    </label>
  );
}

/* ---------- Sample-data notice (pages not yet connected to the database) ---------- */

export function SampleNote() {
  return (
    <p className="m-0 rounded-md bg-warning-bg px-3 py-2 text-[13px] text-warning-fg">
      Sample data for now. This page is not saved to your database yet.
    </p>
  );
}
