import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDate, formatTL, isOverdue } from '@/lib/format';
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER, PRIORITY_LABELS } from '@/types/models';
import type { Priority } from '@/types/models';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { Avatar, EmptyState, PageHeader } from '@/components/common/Basics';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Jobs({ onNewJob }: { onNewJob: (defaults?: object) => void }) {
  const { db, employee, customer, project, currentRole, currentUserId } = useApp();
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>(params.get('durum') ?? 'all');
  const [priority, setPriority] = useState<string>('all');
  const [assignee, setAssignee] = useState<string>('all');
  const [cust, setCust] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState(params.get('geciken') === '1');

  const jobs = useMemo(() => {
    let list = db.jobs;
    if (currentRole === 'calisan') list = list.filter((j) => j.assigneeId === currentUserId);
    const t = q.trim().toLocaleLowerCase('tr');
    if (t) list = list.filter((j) => j.title.toLocaleLowerCase('tr').includes(t) || j.description.toLocaleLowerCase('tr').includes(t));
    if (status !== 'all') list = list.filter((j) => j.status === status);
    if (priority !== 'all') list = list.filter((j) => j.priority === priority);
    if (assignee !== 'all') list = list.filter((j) => j.assigneeId === assignee);
    if (cust !== 'all') list = list.filter((j) => j.customerId === cust);
    if (onlyOverdue) list = list.filter((j) => isOverdue(j.dueDate, j.status));
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [db.jobs, q, status, priority, assignee, cust, onlyOverdue, currentRole, currentUserId]);

  return (
    <div>
      <PageHeader
        title={currentRole === 'calisan' ? 'Bana Atanan İşler' : 'İşler'}
        subtitle={`${jobs.length} iş listeleniyor`}
        actions={
          currentRole !== 'calisan' ? (
            <Button onClick={() => onNewJob()}>
              <Plus className="mr-1.5 size-4" /> Yeni İş
            </Button>
          ) : undefined
        }
      />

      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1 sm:max-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İş ara..."
            className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Durum" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {JOB_STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Öncelik" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm öncelikler</SelectItem>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentRole !== 'calisan' && (
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Çalışan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm çalışanlar</SelectItem>
              {db.employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={cust} onValueChange={setCust}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Müşteri" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm müşteriler</SelectItem>
            {db.customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} className="accent-teal-700" />
          Sadece gecikenler
        </label>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="Henüz iş bulunmuyor."
          hint={currentRole === 'calisan' ? 'Size atanan işler burada görünecek.' : 'Yeni bir iş oluşturarak başlayabilirsiniz.'}
          action={currentRole !== 'calisan' ? <Button onClick={() => onNewJob()}><Plus className="mr-1.5 size-4" /> Yeni İş</Button> : undefined}
        />
      ) : (
        <>
          {/* Masaüstü tablo */}
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">İş</th>
                  <th className="px-4 py-3 font-medium">Müşteri / Proje</th>
                  <th className="px-4 py-3 font-medium">Sorumlu</th>
                  <th className="px-4 py-3 font-medium">Teslim</th>
                  <th className="px-4 py-3 font-medium">Öncelik</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 text-right font-medium">Ücret</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <Link to={`/isler/${j.id}`} className="font-medium hover:text-primary hover:underline">
                        {j.title}
                      </Link>
                      {isOverdue(j.dueDate, j.status) && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                          GECİKTİ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {customer(j.customerId)?.company}
                      {project(j.projectId) && <span className="block text-xs">{project(j.projectId)?.name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Avatar name={employee(j.assigneeId)?.name ?? '?'} color={employee(j.assigneeId)?.color} size="sm" />
                        {employee(j.assigneeId)?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-num text-muted-foreground">{formatDate(j.dueDate)}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={j.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                    <td className="px-4 py-3 text-right font-mono-num">{j.fee > 0 ? formatTL(j.fee) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil kartlar */}
          <div className="space-y-3 md:hidden">
            {jobs.map((j) => (
              <Link key={j.id} to={`/isler/${j.id}`} className="block rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{j.title}</span>
                  <PriorityBadge priority={j.priority} />
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  {customer(j.customerId)?.company}
                  {project(j.projectId) ? ` • ${project(j.projectId)?.name}` : ''}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={j.status} />
                  <span className="text-xs text-muted-foreground">
                    Teslim: {formatDate(j.dueDate)}
                    {isOverdue(j.dueDate, j.status) && <span className="ml-1 font-semibold text-red-600">(Gecikti)</span>}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Avatar name={employee(j.assigneeId)?.name ?? '?'} color={employee(j.assigneeId)?.color} size="sm" />
                  <span className="text-muted-foreground">{employee(j.assigneeId)?.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}