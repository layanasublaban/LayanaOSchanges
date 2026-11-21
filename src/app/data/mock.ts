/** Sample data used by the prototype. Replace with the Neon-backed data layer later. */

export type Space = 'Personal' | 'Business' | 'Lensiyana';

export const SPACE_STYLE: Record<Space, string> = {
  Personal: 'bg-success-bg text-success-fg',
  Business: 'bg-accent-soft text-accent',
  Lensiyana: 'bg-warning-bg text-warning-fg',
};

export const SPACE_DOT: Record<Space, string> = {
  Personal: 'bg-success-fg',
  Business: 'bg-accent',
  Lensiyana: 'bg-warning-fg',
};

export type Task = { id: string; label: string; meta: string; done: boolean };

export const priorities: Task[] = [
  { id: 'p1', label: 'Morning gym and movement', meta: '7:00 AM', done: true },
  { id: 'p2', label: 'Review startup MVP scope', meta: '10:30 AM', done: true },
  { id: 'p3', label: 'Plan Lensiyana carousel', meta: '8:00 PM', done: false },
  { id: 'p4', label: 'Evening athkar and journal', meta: '9:30 PM', done: false },
];

export const habits: Task[] = [
  { id: 'h1', label: 'Morning gym and movement', meta: '12-day streak', done: true },
  { id: 'h2', label: 'Morning athkar', meta: '31-day streak', done: true },
  { id: 'h3', label: 'Read 20 pages', meta: '5-day streak', done: true },
  { id: 'h4', label: 'Evening journal', meta: 'Due 9:30 PM', done: false },
  { id: 'h5', label: 'Stretch and wind down', meta: 'Due 10:30 PM', done: false },
];

export type UpcomingEvent = { day: string; month: string; title: string; time: string };

export const upcoming: UpcomingEvent[] = [
  { day: '21', month: 'NOV', title: 'Client check-in', time: 'Tomorrow, 1:00 PM' },
  { day: '22', month: 'NOV', title: 'Lensiyana reel shoot', time: 'Sunday, 10:00 AM' },
];

export const weekendPersonal: UpcomingEvent[] = [
  { day: '21', month: 'NOV', title: 'Long walk', time: 'Saturday, 9:00 AM' },
  { day: '22', month: 'NOV', title: 'Weekly review', time: 'Sunday, 7:00 PM' },
];

export const lensiyanaPosts: UpcomingEvent[] = [
  { day: '21', month: 'NOV', title: 'Plan with intention (carousel)', time: 'Saturday, 6:00 PM' },
  { day: '22', month: 'NOV', title: 'Studio desk tour (reel)', time: 'Sunday, 10:00 AM' },
  { day: '24', month: 'NOV', title: 'Client work, behind the scenes', time: 'Tuesday, 6:00 PM' },
];

export const spaces = [
  { to: '/personal', key: 'personal', title: 'Personal', meta: 'Habits, goals, weekend' },
  { to: '/business', key: 'business', title: 'Business', meta: 'Clients, projects, invoices' },
  { to: '/lensiyana', key: 'lensiyana', title: 'Lensiyana', meta: 'Content pipeline' },
] as const;

/* ---------------- calendar ---------------- */

export type CalendarEvent = {
  day: number; // 0 = Monday … 6 = Sunday
  start: number; // hour as decimal, 10.5 = 10:30
  duration: number; // hours
  title: string;
  space: Space;
};

export const WEEK_START = 16; // Monday 16 November 2026
export const TODAY_INDEX = 4; // Friday 20 November

export const calendarEvents: CalendarEvent[] = [
  { day: 0, start: 7, duration: 1, title: 'Gym', space: 'Personal' },
  { day: 0, start: 11, duration: 1, title: 'Client call — Maram', space: 'Business' },
  { day: 0, start: 15, duration: 1.5, title: 'Plan content week', space: 'Lensiyana' },
  { day: 1, start: 7, duration: 1, title: 'Gym', space: 'Personal' },
  { day: 1, start: 10, duration: 0.5, title: 'Startup standup', space: 'Business' },
  { day: 1, start: 14, duration: 2, title: 'Reel editing', space: 'Lensiyana' },
  { day: 2, start: 7, duration: 1, title: 'Gym', space: 'Personal' },
  { day: 2, start: 10.5, duration: 1.5, title: 'Review MVP scope', space: 'Business' },
  { day: 2, start: 18, duration: 2, title: 'Family dinner', space: 'Personal' },
  { day: 3, start: 7, duration: 1, title: 'Gym', space: 'Personal' },
  { day: 3, start: 13, duration: 1, title: 'Invoice follow-ups', space: 'Business' },
  { day: 3, start: 16, duration: 2, title: 'Carousel design', space: 'Lensiyana' },
  { day: 4, start: 7, duration: 1, title: 'Gym', space: 'Personal' },
  { day: 4, start: 10.5, duration: 1, title: 'Review MVP scope', space: 'Business' },
  { day: 4, start: 13, duration: 0.5, title: 'Prepare client check-in', space: 'Business' },
  { day: 4, start: 20, duration: 1, title: 'Plan carousel', space: 'Lensiyana' },
  { day: 5, start: 9, duration: 1.5, title: 'Long walk', space: 'Personal' },
  { day: 5, start: 13, duration: 1, title: 'Client check-in', space: 'Business' },
  { day: 6, start: 10, duration: 2, title: 'Reel shoot', space: 'Lensiyana' },
  { day: 6, start: 19, duration: 1, title: 'Weekly review', space: 'Personal' },
];

export function formatHour(decimal: number): string {
  const h = Math.floor(decimal);
  const m = decimal % 1 ? '30' : '00';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

/* ---------------- personal ---------------- */

export const goals = [
  { title: 'Launch the Life OS MVP', meta: 'Business · due 15 Dec', pct: 60 },
  { title: 'Run 10 km without stopping', meta: 'Personal · due 31 Dec', pct: 45 },
  { title: 'Reach 5,000 Lensiyana followers', meta: 'Lensiyana · due 31 Dec', pct: 72 },
];

/* ---------------- business ---------------- */

export type Tone = 'success' | 'warning' | 'danger' | 'info';

export const clients = [
  { initial: 'M', name: 'Maram Studio', meta: 'Brand identity · due 28 Nov', badge: 'Active', tone: 'success' as Tone, value: '$3,200' },
  { initial: 'N', name: 'Noor Cafe', meta: 'Website redesign · due 12 Dec', badge: 'Active', tone: 'success' as Tone, value: '$4,800' },
  { initial: 'K', name: 'Kadi Health', meta: 'App UI kit · proposal sent', badge: 'Proposal', tone: 'warning' as Tone, value: '$8,200' },
  { initial: 'A', name: 'Arkan Group', meta: 'Retainer · invoice due', badge: 'Invoice due', tone: 'danger' as Tone, value: '$1,250' },
];

export const projects = [
  { title: 'Life OS MVP', meta: 'Startup · due 15 Dec', pct: 60 },
  { title: 'Maram brand identity', meta: 'Freelance · due 28 Nov', pct: 85 },
  { title: 'Noor website redesign', meta: 'Freelance · due 12 Dec', pct: 40 },
];

export const contracts = [
  { title: 'Maram — Brand identity', meta: 'Signed 4 Nov', badge: 'Signed', tone: 'success' as Tone },
  { title: 'Kadi — App UI kit', meta: 'Sent 18 Nov', badge: 'Awaiting', tone: 'warning' as Tone },
  { title: 'Noor — Website', meta: 'Draft', badge: 'Draft', tone: 'info' as Tone },
];

export const invoices = [
  { title: 'INV-0042 · Arkan', meta: 'Due 22 Nov', badge: 'Overdue', tone: 'danger' as Tone, value: '$1,250' },
  { title: 'INV-0043 · Noor', meta: 'Due 30 Nov', badge: 'Sent', tone: 'info' as Tone, value: '$1,200' },
  { title: 'INV-0041 · Maram', meta: 'Paid 12 Nov', badge: 'Paid', tone: 'success' as Tone, value: '$3,200' },
];

/* ---------------- lensiyana ---------------- */

export const pipeline = [
  { column: 'Ideas', count: 5, cards: [{ title: 'Why I redesign before I code', type: 'Carousel', tone: 'info' as Tone }, { title: '3 habits that fixed my mornings', type: 'Reel', tone: 'info' as Tone }] },
  { column: 'Scripted', count: 2, cards: [{ title: 'Designing a calm dashboard', type: 'Reel', tone: 'warning' as Tone }] },
  { column: 'Ready', count: 2, cards: [{ title: 'Brand voice in 5 steps', type: 'Carousel', tone: 'success' as Tone }, { title: 'Studio desk tour', type: 'Reel', tone: 'success' as Tone }] },
  { column: 'Scheduled', count: 3, cards: [{ title: 'Plan with intention', type: 'Carousel', tone: 'success' as Tone }, { title: 'Client work, behind the scenes', type: 'Reel', tone: 'success' as Tone }] },
];

/* ---------------- finance ---------------- */

export const cashFlow = [
  { month: 'Jun', income: 90, expenses: 60 },
  { month: 'Jul', income: 110, expenses: 70 },
  { month: 'Aug', income: 80, expenses: 65 },
  { month: 'Sep', income: 130, expenses: 80 },
  { month: 'Oct', income: 120, expenses: 75 },
  { month: 'Nov', income: 150, expenses: 85 },
];

export const transactions = [
  { title: 'Maram Studio payment', meta: 'Business · 12 Nov', badge: 'Business', tone: 'info' as Tone, value: '+$3,200' },
  { title: 'Groceries', meta: 'Personal · 18 Nov', badge: 'Personal', tone: 'success' as Tone, value: '-$84' },
  { title: 'Figma subscription', meta: 'Business · 17 Nov', badge: 'Business', tone: 'info' as Tone, value: '-$15' },
  { title: 'Gym membership', meta: 'Personal · 15 Nov', badge: 'Personal', tone: 'success' as Tone, value: '-$40' },
];

export const budgets = [
  { title: 'Business tools', meta: '$240 of $400', pct: 60 },
  { title: 'Groceries', meta: '$310 of $450', pct: 69 },
  { title: 'Eating out', meta: '$120 of $150', pct: 80 },
];

/* ---------------- assistant ---------------- */

export const permissions: { space: string; level: string; tone: Tone }[] = [
  { space: 'Personal', level: 'Execute', tone: 'success' },
  { space: 'Business', level: 'Draft', tone: 'warning' },
  { space: 'Lensiyana', level: 'Execute', tone: 'success' },
  { space: 'Finance', level: 'Suggest', tone: 'info' },
];

export const standingApprovals = [
  'Add reminders to my calendar',
  'Reschedule habits when I run late',
  'Draft replies to client emails',
];
