import { JOB_STATUS_LABELS, PRIORITY_LABELS, PROJECT_STATUS_LABELS } from '@/types/models';
import type { JobStatus, Priority, ProjectStatus } from '@/types/models';
import { cn } from '@/lib/utils';

const statusStyles: Record<JobStatus, string> = {
  yeni: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  planlandi: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  devam: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  beklemede: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  kontrolde: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  tamamlandi: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  iptal: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        statusStyles[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  yuksek: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  orta: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  dusuk: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const priorityDot: Record<Priority, string> = {
  yuksek: 'bg-red-500',
  orta: 'bg-amber-500',
  dusuk: 'bg-emerald-500',
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        priorityStyles[priority],
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', priorityDot[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

const projectStatusStyles: Record<ProjectStatus, string> = {
  planlandi: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  devam: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  beklemede: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  tamamlandi: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  iptal: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        projectStatusStyles[status]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
