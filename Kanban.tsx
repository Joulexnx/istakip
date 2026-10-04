import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useApp } from '@/store/AppContext';
import { formatDate, isOverdue } from '@/lib/format';
import type { JobStatus } from '@/types/models';
import { PriorityBadge } from '@/components/common/Badges';
import { Avatar, PageHeader } from '@/components/common/Basics';
import { cn } from '@/lib/utils';

const COLUMNS: { key: JobStatus; label: string; drop: JobStatus }[] = [
  { key: 'yeni', label: 'YENİ', drop: 'yeni' },
  { key: 'planlandi', label: 'PLANLANDI', drop: 'planlandi' },
  { key: 'devam', label: 'DEVAM EDİYOR', drop: 'devam' },
  { key: 'beklemede', label: 'BEKLİYOR', drop: 'beklemede' },
  { key: 'tamamlandi', label: 'TAMAMLANDI', drop: 'tamamlandi' },
];

export default function Kanban() {
  const { db, employee, customer, setJobStatus, currentRole, currentUserId } = useApp();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState<JobStatus | null>(null);

  let jobs = db.jobs.filter((j) => j.status !== 'iptal');
  if (currentRole === 'calisan') jobs = jobs.filter((j) => j.assigneeId === currentUserId);

  const inColumn = (col: JobStatus) =>
    jobs.filter((j) => (col === 'beklemede' ? j.status === 'beklemede' || j.status === 'kontrolde' : j.status === col));

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Görev Panosu" subtitle="Kartları sürükleyerek iş durumunu değiştirin" />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col.drop);
            }}
            onDragLeave={() => setDragOver((d) => (d === col.drop ? null : d))}
            onDrop={(e) => {
              e.preventDefault();
              const jobId = e.dataTransfer.getData('text/job-id');
              if (jobId) {
                setJobStatus(jobId, col.drop);
                toast.success('İş durumu güncellendi.');
              }
              setDragOver(null);
            }}
            className={cn(
              'flex w-64 shrink-0 flex-col rounded-xl border bg-secondary/40 transition-colors',
              dragOver === col.drop && 'border-primary bg-primary/5'
            )}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{col.label}</span>
              <span className="rounded-full bg-card px-2 py-0.5 font-mono-num text-xs font-semibold">{inColumn(col.key).length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {inColumn(col.key).map((j) => (
                <div
                  key={j.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/job-id', j.id)}
                  onClick={() => navigate(`/isler/${j.id}`)}
                  className={cn(
                    'cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
                    isOverdue(j.dueDate, j.status) && 'border-red-300 dark:border-red-800'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug">{j.title}</span>
                    <PriorityBadge priority={j.priority} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{customer(j.customerId)?.company}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar name={employee(j.assigneeId)?.name ?? '?'} color={employee(j.assigneeId)?.color} size="sm" />
                      {employee(j.assigneeId)?.name.split(' ')[0]}
                    </span>
                    <span className={cn('font-mono-num text-xs', isOverdue(j.dueDate, j.status) ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
                      {formatDate(j.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
              {inColumn(col.key).length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">Bu kolonda iş yok.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
