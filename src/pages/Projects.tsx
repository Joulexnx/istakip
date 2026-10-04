import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDate, formatTL } from '@/lib/format';
import { PROJECT_STATUS_LABELS } from '@/types/models';
import type { ProjectStatus } from '@/types/models';
import { ProjectStatusBadge } from '@/components/common/Badges';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, PageHeader, ProgressBar } from '@/components/common/Basics';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Projects() {
  const { db, customer, addProject } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', customerId: '', startDate: '', endDate: '', budget: '', note: '' });
  const [error, setError] = useState('');

  const submit = () => {
    if (!form.name.trim()) return setError('Proje adı zorunludur.');
    if (!form.customerId) return setError('Müşteri seçiniz.');
    addProject({
      name: form.name.trim(),
      customerId: form.customerId,
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate || new Date().toISOString().slice(0, 10),
      status: 'planlandi',
      budget: Number(form.budget) || 0,
      note: form.note,
    });
    toast.success('Proje oluşturuldu.');
    setOpen(false);
    setForm({ name: '', customerId: '', startDate: '', endDate: '', budget: '', note: '' });
    setError('');
  };

  return (
    <div>
      <PageHeader
        title="Projeler"
        subtitle={`${db.projects.length} proje`}
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 size-4" /> Yeni Proje</Button>}
      />

      {db.projects.length === 0 ? (
        <EmptyState title="Henüz proje bulunmuyor." hint="İlk projenizi oluşturun." action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 size-4" /> Yeni Proje</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {db.projects.map((p) => {
            const jobs = db.jobs.filter((j) => j.projectId === p.id && j.status !== 'iptal');
            const done = jobs.filter((j) => j.status === 'tamamlandi').length;
            const pct = jobs.length ? Math.round((done / jobs.length) * 100) : 0;
            return (
              <Link key={p.id} to={`/projeler/${p.id}`} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Müşteri: {customer(p.customerId)?.company}</p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono-num">
                  {formatDate(p.startDate)} — {formatDate(p.endDate)}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={pct} className="flex-1" />
                  <span className="font-mono-num text-sm font-semibold text-primary">%{pct}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Toplam görev: {jobs.length} • Tamamlanan: {done}</span>
                  {p.budget > 0 && <span className="font-mono-num">Bütçe: {formatTL(p.budget)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Proje</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Proje adı *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Web Sitesi" />
            </div>
            <div>
              <Label>Müşteri *</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
                <SelectContent>
                  {db.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Başlangıç</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <Label>Teslim</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Proje bütçesi (₺)</Label>
              <Input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div>
              <Label>Not</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
              <Button onClick={submit}>Oluştur</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, customer, employee, deleteProject, updateProject, currentRole } = useApp();
  const [confirm, setConfirm] = useState(false);
  const p = db.projects.find((x) => x.id === id);
  if (!p) return <p className="py-20 text-center text-muted-foreground">Proje bulunamadı.</p>;

  const jobs = db.jobs.filter((j) => j.projectId === p.id && j.status !== 'iptal');
  const done = jobs.filter((j) => j.status === 'tamamlandi').length;
  const pct = jobs.length ? Math.round((done / jobs.length) * 100) : 0;
  const income = db.transactions.filter((t) => t.projectId === p.id && t.type === 'gelir').reduce((s, t) => s + t.amount, 0);
  const expense = db.transactions.filter((t) => t.projectId === p.id && t.type === 'gider').reduce((s, t) => s + t.amount, 0);
  const members = [...new Set(jobs.map((j) => j.assigneeId))];

  return (
    <div>
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{p.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Müşteri: <Link to={`/musteriler/${p.customerId}`} className="font-medium text-foreground hover:text-primary hover:underline">{customer(p.customerId)?.company}</Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={p.status} onValueChange={(v) => { updateProject(p.id, { status: v as ProjectStatus }); toast.success('Proje durumu güncellendi.'); }}>
              <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentRole === 'yonetici' && (
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirm(true)}>Sil</Button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><span className="block text-xs text-muted-foreground">Başlangıç</span><span className="font-mono-num font-medium">{formatDate(p.startDate)}</span></div>
          <div><span className="block text-xs text-muted-foreground">Teslim</span><span className="font-mono-num font-medium">{formatDate(p.endDate)}</span></div>
          <div><span className="block text-xs text-muted-foreground">Toplam görev</span><span className="font-mono-num font-medium">{jobs.length}</span></div>
          <div><span className="block text-xs text-muted-foreground">Tamamlanan</span><span className="font-mono-num font-medium">{done}</span></div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={pct} className="flex-1" />
          <span className="font-mono-num text-sm font-semibold text-primary">%{pct}</span>
        </div>
        {p.note && <p className="mt-4 text-sm text-muted-foreground">{p.note}</p>}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: 'Bütçe', v: formatTL(p.budget) },
          { l: 'Gelir', v: formatTL(income) },
          { l: 'Maliyet', v: formatTL(expense) },
          { l: 'Kâr', v: formatTL(income - expense), c: income - expense >= 0 ? 'text-emerald-600' : 'text-red-600' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border bg-card p-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</span>
            <div className={`mt-1 font-mono-num text-lg font-bold ${s.c ?? ''}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Proje Görevleri</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu projeye bağlı iş yok.</p>
          ) : (
            <ul className="divide-y text-sm">
              {jobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link to={`/isler/${j.id}`} className="font-medium hover:text-primary hover:underline">{j.title}</Link>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {employee(j.assigneeId)?.name} • {formatDate(j.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Projede Çalışanlar</h2>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz atama yok.</p>
          ) : (
            <ul className="space-y-2.5">
              {members.map((mid) => {
                const e = employee(mid);
                return (
                  <li key={mid} className="flex items-center gap-2.5 text-sm">
                    <span className="inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: e?.color }}>
                      {e?.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                    </span>
                    <div>
                      <div className="font-medium">{e?.name}</div>
                      <div className="text-xs text-muted-foreground">{e?.position}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Proje silinsin mi?"
        description={`"${p.name}" projesi silinecek. Projeye bağlı işler silinmez.`}
        onConfirm={() => {
          deleteProject(p.id);
          toast.success('Proje silindi.');
          navigate('/projeler');
        }}
      />
    </div>
  );
}