import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  PlayCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '@/store/AppContext';
import { isDueToday, isOverdue } from '@/lib/format';
import { JOB_STATUS_LABELS } from '@/types/models';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { Avatar, PageHeader, StatCard, EmptyState } from '@/components/common/Basics';

const PIE_COLORS: Record<string, string> = {
  yeni: '#64748b',
  planlandi: '#3b82f6',
  devam: '#0d9488',
  beklemede: '#f59e0b',
  kontrolde: '#8b5cf6',
  tamamlandi: '#10b981',
  iptal: '#ef4444',
};

export default function Dashboard() {
  const { db, employee, customer } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const jobs = db.jobs;
    return {
      total: jobs.length,
      active: jobs.filter((j) => ['yeni', 'planlandi', 'devam', 'beklemede', 'kontrolde'].includes(j.status)).length,
      today: jobs.filter((j) => isDueToday(j.dueDate) && j.status !== 'tamamlandi' && j.status !== 'iptal').length,
      overdue: jobs.filter((j) => isOverdue(j.dueDate, j.status)).length,
      done: jobs.filter((j) => j.status === 'tamamlandi').length,
      projects: db.projects.filter((p) => p.status === 'devam').length,
    };
  }, [db]);

  const todayJobs = useMemo(
    () =>
      db.jobs
        .filter((j) => isDueToday(j.dueDate) && j.status !== 'tamamlandi' && j.status !== 'iptal')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [db.jobs]
  );

  const overdueHigh = useMemo(
    () => db.jobs.filter((j) => isOverdue(j.dueDate, j.status) && j.priority === 'yuksek'),
    [db.jobs]
  );

  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {};
    db.jobs.forEach((j) => {
      counts[j.status] = (counts[j.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({ name: JOB_STATUS_LABELS[k as keyof typeof JOB_STATUS_LABELS], value: v, key: k }));
  }, [db.jobs]);

  const monthlyJobs = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(new Date(), 5 - i);
      const key = format(m, 'yyyy-MM');
      const count = db.jobs.filter((j) => j.createdAt.slice(0, 7) === key).length;
      return { name: format(m, 'LLL', { locale: tr }), count };
    });
  }, [db.jobs]);

  const monthlyFinance = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(new Date(), 5 - i);
      const key = format(m, 'yyyy-MM');
      const gelir = db.transactions.filter((t) => t.type === 'gelir' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const gider = db.transactions.filter((t) => t.type === 'gider' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { name: format(m, 'LLL', { locale: tr }), Gelir: gelir, Gider: gider };
    });
  }, [db.transactions]);

  const perf = useMemo(() => {
    return db.employees
      .filter((e) => e.active)
      .map((e) => ({
        name: e.name.split(' ')[0],
        Tamamlanan: db.jobs.filter((j) => j.assigneeId === e.id && j.status === 'tamamlandi').length,
      }));
  }, [db]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${db.settings.companyName} — genel durum, ${format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}`}
      />

      {/* Genel durum */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Toplam İş" value={stats.total} icon={Briefcase} onClick={() => navigate('/isler')} />
        <StatCard label="Devam Eden" value={stats.active} icon={PlayCircle} tone="info" onClick={() => navigate('/isler?durum=devam')} />
        <StatCard label="Bugün" value={stats.today} icon={Clock3} />
        <StatCard label="Geciken" value={stats.overdue} icon={AlertTriangle} tone="danger" onClick={() => navigate('/isler?geciken=1')} />
        <StatCard label="Tamamlanan" value={stats.done} icon={CheckCircle2} tone="success" onClick={() => navigate('/isler?durum=tamamlandi')} />
        <StatCard label="Aktif Proje" value={stats.projects} icon={FolderKanban} onClick={() => navigate('/projeler')} />
      </div>

      {/* Geciken yüksek öncelikli işler */}
      {overdueHigh.length > 0 && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <AlertTriangle className="size-4" /> Geciken yüksek öncelikli işler ({overdueHigh.length})
          </h2>
          <div className="mt-2 space-y-1.5">
            {overdueHigh.map((j) => (
              <Link
                key={j.id}
                to={`/isler/${j.id}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-sm hover:shadow-sm"
              >
                <span className="font-medium">{j.title}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" /> {j.dueDate.split('-').reverse().join('.')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bugünkü işler */}
      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold">Bugünkü İşler</h2>
        {todayJobs.length === 0 ? (
          <EmptyState title="Bugün için planlanmış iş bulunmuyor." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {todayJobs.map((j) => (
              <Link
                key={j.id}
                to={`/isler/${j.id}`}
                className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {j.time && <span className="font-mono-num text-sm font-semibold text-primary">{j.time}</span>}
                    <span className="font-semibold">{j.title}</span>
                  </div>
                  <PriorityBadge priority={j.priority} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Avatar name={employee(j.assigneeId)?.name ?? '?'} color={employee(j.assigneeId)?.color} size="sm" />
                    {employee(j.assigneeId)?.name}
                  </span>
                  <span>{customer(j.customerId)?.company}</span>
                </div>
                <div className="mt-3">
                  <StatusBadge status={j.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grafikler */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">İş Durumları</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusChart.map((s) => (
                    <Cell key={s.key} fill={PIE_COLORS[s.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Aylık İş Sayısı</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={monthlyJobs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="count" name="İş" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Gelir / Gider (Aylık)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => `${Math.round(v / 1000)}B`} />
                <Tooltip formatter={(v) => `₺${Number(v).toLocaleString('tr-TR')}`} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Çalışan Performansı (tamamlanan iş)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={perf} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip />
                <Bar dataKey="Tamamlanan" fill="#12141f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}