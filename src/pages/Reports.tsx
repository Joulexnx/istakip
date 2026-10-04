import { useMemo } from 'react';
import { subMonths, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '@/store/AppContext';
import { daysDiff, formatDateTime, formatTL, isOverdue } from '@/lib/format';
import { PageHeader, Avatar } from '@/components/common/Basics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Reports() {
  const { db, employee, currentRole } = useApp();

  const jobReport = useMemo(() => ({
    total: db.jobs.length,
    done: db.jobs.filter((j) => j.status === 'tamamlandi').length,
    active: db.jobs.filter((j) => ['yeni', 'planlandi', 'devam', 'beklemede', 'kontrolde'].includes(j.status)).length,
    overdue: db.jobs.filter((j) => isOverdue(j.dueDate, j.status)).length,
    cancelled: db.jobs.filter((j) => j.status === 'iptal').length,
  }), [db.jobs]);

  const employeeReport = useMemo(() => {
    return db.employees.map((e) => {
      const jobs = db.jobs.filter((j) => j.assigneeId === e.id);
      const done = jobs.filter((j) => j.status === 'tamamlandi' && j.completedAt);
      const avg = done.length
        ? done.reduce((s, j) => s + daysDiff(j.createdAt, j.completedAt!), 0) / done.length
        : 0;
      return {
        id: e.id,
        name: e.name,
        total: jobs.length,
        done: done.length,
        overdue: jobs.filter((j) => isOverdue(j.dueDate, j.status)).length,
        avgDays: Math.round(avg * 10) / 10,
      };
    });
  }, [db]);

  const customerReport = useMemo(() => {
    return db.customers
      .map((c) => ({
        id: c.id,
        company: c.company,
        jobCount: db.jobs.filter((j) => j.customerId === c.id).length,
        total: db.jobs.filter((j) => j.customerId === c.id).reduce((s, j) => s + j.fee, 0),
        status: c.status,
      }))
      .sort((a, b) => b.total - a.total);
  }, [db]);

  const financeByMonth = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(new Date(), 5 - i);
      const key = format(m, 'yyyy-MM');
      const gelir = db.transactions.filter((t) => t.type === 'gelir' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const gider = db.transactions.filter((t) => t.type === 'gider' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { name: format(m, 'LLL', { locale: tr }), Gelir: gelir, Gider: gider, Net: gelir - gider };
    });
  }, [db.transactions]);

  return (
    <div>
      <PageHeader title="Raporlar" subtitle="İş, çalışan, müşteri ve finans analizleri" />

      <Tabs defaultValue="is">
        <TabsList className="mb-4 flex w-full flex-wrap sm:w-auto">
          <TabsTrigger value="is">İş Raporu</TabsTrigger>
          <TabsTrigger value="calisan">Çalışan Raporu</TabsTrigger>
          <TabsTrigger value="musteri">Müşteri Raporu</TabsTrigger>
          <TabsTrigger value="finans">Finans Raporu</TabsTrigger>
          {currentRole === 'yonetici' && <TabsTrigger value="aktivite">Aktivite Geçmişi</TabsTrigger>}
        </TabsList>

        <TabsContent value="is">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { l: 'Toplam iş', v: jobReport.total },
              { l: 'Tamamlanan', v: jobReport.done, c: 'text-emerald-600' },
              { l: 'Devam eden', v: jobReport.active, c: 'text-blue-600' },
              { l: 'Geciken', v: jobReport.overdue, c: 'text-red-600' },
              { l: 'İptal edilen', v: jobReport.cancelled },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border bg-card p-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</span>
                <div className={`mt-1 font-mono-num text-xl font-bold ${s.c ?? ''}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Aylık oluşturulan iş sayısı</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart
                  data={Array.from({ length: 6 }, (_, i) => {
                    const m = subMonths(new Date(), 5 - i);
                    const key = format(m, 'yyyy-MM');
                    return {
                      name: format(m, 'LLL', { locale: tr }),
                      İş: db.jobs.filter((j) => j.createdAt.slice(0, 7) === key).length,
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip />
                  <Bar dataKey="İş" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calisan">
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Çalışan</th>
                  <th className="px-4 py-3 text-right font-medium">Toplam iş</th>
                  <th className="px-4 py-3 text-right font-medium">Tamamlanan</th>
                  <th className="px-4 py-3 text-right font-medium">Geciken</th>
                  <th className="px-4 py-3 text-right font-medium">Ort. tamamlanma</th>
                </tr>
              </thead>
              <tbody>
                {employeeReport.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Avatar name={r.name} color={employee(r.id)?.color} size="sm" />
                        <span className="font-medium">{r.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-num">{r.total}</td>
                    <td className="px-4 py-3 text-right font-mono-num text-emerald-600">{r.done}</td>
                    <td className={`px-4 py-3 text-right font-mono-num ${r.overdue > 0 ? 'font-semibold text-red-600' : ''}`}>{r.overdue}</td>
                    <td className="px-4 py-3 text-right font-mono-num">{r.avgDays} gün</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="musteri">
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 text-right font-medium">İş sayısı</th>
                  <th className="px-4 py-3 text-right font-medium">Toplam iş tutarı</th>
                  <th className="px-4 py-3 text-right font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {customerReport.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{r.company}</td>
                    <td className="px-4 py-3 text-right font-mono-num">{r.jobCount}</td>
                    <td className="px-4 py-3 text-right font-mono-num">{formatTL(r.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === 'aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        {r.status === 'aktif' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="finans">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Aylık gelir / gider / net</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={financeByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `${Math.round(v / 1000)}B`} />
                  <Tooltip formatter={(v) => formatTL(Number(v))} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net" fill="#12141f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {currentRole === 'yonetici' && (
          <TabsContent value="aktivite">
            <div className="rounded-xl border bg-card">
              {db.activities.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">Henüz aktivite kaydı yok.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {db.activities.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                      <Avatar name={employee(a.userId)?.name ?? '?'} color={employee(a.userId)?.color} size="sm" />
                      <div>
                        <span className="font-medium">{employee(a.userId)?.name ?? 'Bilinmiyor'}</span>
                        <span className="ml-2 text-muted-foreground">{a.text}</span>
                        <div className="font-mono-num text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}