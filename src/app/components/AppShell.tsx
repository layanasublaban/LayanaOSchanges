import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CalendarDays,
  Heart,
  House,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { Avatar } from './ui';

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const OVERVIEW: NavItem[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquare },
];
const SPACES: NavItem[] = [
  { to: '/personal', label: 'Personal', icon: Heart },
  { to: '/business', label: 'Business', icon: Briefcase },
  { to: '/lensiyana', label: 'Lensiyana', icon: Sparkles },
];
const MANAGE: NavItem[] = [{ to: '/finance', label: 'Finance', icon: Wallet }];

const TABS: NavItem[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/assistant', label: 'Assistant', icon: MessageSquare },
  { to: '/business', label: 'Business', icon: Briefcase },
  { to: '/more', label: 'More', icon: SlidersHorizontal },
];

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium no-underline transition-colors',
          isActive ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-soft',
        )
      }
    >
      <Icon size={18} aria-hidden />
      {item.label}
    </NavLink>
  );
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      <p className="m-0 mb-1 px-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-3">{label}</p>
      {items.map((item) => (
        <SidebarLink key={item.to} item={item} />
      ))}
    </nav>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent text-white"
      >
        <Sparkles size={18} />
      </span>
      <span className="font-heading text-xl text-ink">Life OS</span>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col gap-6 border-r border-line-subtle bg-surface p-4 lg:flex">
      <Brand />
      <div className="flex items-center gap-3 rounded-lg border border-line-subtle bg-soft p-3">
        <Avatar label="L" size={36} />
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium text-ink">Layana</span>
          <span className="text-xs text-ink-3">All spaces</span>
        </div>
      </div>
      <NavGroup label="Overview" items={OVERVIEW} />
      <NavGroup label="Spaces" items={SPACES} />
      <NavGroup label="Manage" items={MANAGE} />
      <div className="mt-auto">
        <SidebarLink item={{ to: '/settings', label: 'Settings', icon: SlidersHorizontal }} />
      </div>
    </aside>
  );
}

function TabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line-subtle bg-surface px-3 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium no-underline',
              isActive ? 'text-accent' : 'text-ink-3',
            )
          }
        >
          <Icon size={24} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-3">{eyebrow}</p>
        <h1 className="text-[22px] leading-[30px] text-ink lg:text-[32px] lg:leading-10">{title}</h1>
      </div>
      {children}
      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink-2"
      >
        <Bell size={20} aria-hidden />
      </button>
      <span className="hidden lg:inline-flex">
        <Avatar label="L" />
      </span>
    </header>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="mx-auto flex w-full min-w-0 max-w-[1320px] flex-1 flex-col gap-5 px-5 pt-14 pb-28 lg:gap-7 lg:px-12 lg:pt-8 lg:pb-10">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
