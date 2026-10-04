import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: 'default' | 'danger' | 'success' | 'info';
  onClick?: () => void;
}) {
  const tones = {
    default: 'text-foreground',
    danger: 'text-red-600 dark:text-red-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    info: 'text-blue-600 dark:text-blue-400',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border bg-card p-4 text-left transition-shadow hover:shadow-md',
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>
      <div className={cn('mt-2 text-2xl font-bold font-mono-num', tones[tone])}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </button>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-14 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Avatar({ name, color, size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const sizes = { sm: 'size-6 text-[10px]', md: 'size-8 text-xs', lg: 'size-12 text-base' };
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sizes[size])}
      style={{ backgroundColor: color ?? '#64748b' }}
    >
      {initials}
    </span>
  );
}
