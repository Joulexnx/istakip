import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Mail, Phone, Plus } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDate, isOverdue, isDueToday } from '@/lib/format';
import { ROLE_LABELS } from '@/types/models';
import type { Role } from '@/types/models';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { Avatar, EmptyState, PageHeader } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const AVATAR_COLORS = ['#0d9488', '#2563eb', '#db2777', '#d97706', '#7c3aed', '#dc2626', '#059669', '#4f46e5'];

export default function Employees() {
  const { db, addEmployee } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', departmentId: '', position: '', role: 'calisan' as Role });
  const [error, setError] = useState('');

  const submit = () => {
    if (!form.name.trim()) return setError('Ad soyad zorunludur.');
    addEmployee({
      name: form.name.trim(),
      phone: form.phone,
      email: form.email,
      departmentId: form.departmentId || (db.departments[0]?.id ?? ''),
      position: form.position,
      startDate: new Date().toISOString().slice(0, 10),
      active: true,
      role: form.role,
      color: AVATAR_COLORS[db.employees.length % AVATAR_COLORS.length],
    });
    toast.success('Çalışan eklendi.');
    setOpen(false);
    setForm({ name: '', phone: '', email: '', departmentId: '', position: '', role: 'calisan' });
    setError('');
  };

  const deptName = (id: string) => db.departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div>
      <PageHeader
        title="Çalışanlar"
        subtitle={`${db.employees.filter((e) => e.active).length} aktif çalışan`}
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 size-4" /> Çalışan Ekle</Button>}
      />

      {db.employees.length === 0 ? (
        <EmptyState title="Henüz çalışan bulunmuyor." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {db.employees.map((e) => {
            const active = db.jobs.filter((j) => j.assigneeId === e.id && !['tamamlandi', 'iptal'].includes(j.status)).length;
            return (
              <Link key={e.id} to={`/calisanlar/${e.id}`} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Avatar name={e.name} color={e.color} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{e.name}</h3>
                    <p className="truncate text-sm text-muted-foreground">{e.position}</p>
                    <p className="text-xs text-muted-foreground">{deptName(e.departmentId)} • {ROLE_LABELS[e.role]}</p>
                  </div>
                  <span className={`ml-auto size-2.5 rounded-full ${e.active ? 'bg-emerald-500' : 'bg-slate-300'}`} title={e.active ? 'Aktif' : 'Pasif'} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="size-3" /> {e.phone || '—'}</span>
                  <span>{active} aktif iş</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Çalışan Ekle</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Ad soyad *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Deniz Ak" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xx xxx xx xx" />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Departman</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Departman seçin" /></SelectTrigger>
                <SelectContent>
                  {db.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pozisyon</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button onClick={submit}>Ekle</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, updateEmployee, deleteEmployee, currentRole, customer } = useApp();
  const [confirm, setConfirm] = useState(false);
  const e = db.employees.find((x) => x.id === id);
  if (!e) return <p className="py-20 text-center text-muted-foreground">Çalışan bulunamadı.</p>;

  const jobs = db.jobs.filter((j) => j.assigneeId === e.id);
  const active = jobs.filter((j) => !['tamamlandi', 'iptal'].includes(j.status));
  const done = jobs.filter((j) => j.status === 'tamamlandi');
  const overdue = jobs.filter((j) => isOverdue(j.dueDate, j.status));
  const thisMonth = new Date().toISOString().slice(0, 7);
  const doneThisMonth = done.filter((j) => j.completedAt?.startsWith(thisMonth)).length;
  const dept = db.departments.find((d) => d.id === e.departmentId);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={e.name} color={e.color} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl">{e.name}</h1>
            <p className="text-sm text-muted-foreground">{e.position} • {dept?.name ?? '—'}</p>
          </div>
          {currentRole === 'yonetici' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={e.active} onCheckedChange={(v) => updateEmployee(e.id, { active: v })} />
                {e.active ? 'Aktif' : 'Pasif'}
              </label>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirm(true)}>Sil</Button>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 border-t pt-4 text-sm sm:grid-cols-3">
          <span className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" /> {e.phone || '—'}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" /> {e.email || '—'}</span>
          <span className="text-muted-foreground">İşe giriş: <span className="font-mono-num">{formatDate(e.startDate)}</span></span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: 'Aktif işler', v: active.length },
          { l: 'Tamamlanan', v: done.length },
          { l: 'Geciken', v: overdue.length, c: overdue.length > 0 ? 'text-red-600' : '' },
          { l: 'Bu ay tamamlanan', v: doneThisMonth },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border bg-card p-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</span>
            <div className={`mt-1 font-mono-num text-xl font-bold ${s.c ?? ''}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Atanmış İşler</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bu çalışana atanmış iş yok.</p>
        ) : (
          <ul className="divide-y text-sm">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <Link to={`/isler/${j.id}`} className="font-medium hover:text-primary hover:underline">
                  {j.title}
                  {isDueToday(j.dueDate) && <span className="ml-2 text-xs text-primary">(bugün)</span>}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{customer(j.customerId)?.company}</span>
                  <PriorityBadge priority={j.priority} />
                  <StatusBadge status={j.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Çalışan silinsin mi?"
        description={`${e.name} silinecek. Atanmış işleri silinmez ancak sorumlusuz kalır.`}
        onConfirm={() => {
          deleteEmployee(e.id);
          toast.success('Çalışan silindi.');
          navigate('/calisanlar');
        }}
      />
    </div>
  );
}