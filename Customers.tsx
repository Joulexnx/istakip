import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Building2, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatTL } from '@/lib/format';
import { StatusBadge, ProjectStatusBadge } from '@/components/common/Badges';
import { EmptyState, PageHeader } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Customers() {
  const { db, addCustomer } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: '', contact: '', phone: '', email: '', address: '', taxOffice: '', taxNo: '', note: '', tags: '' });
  const [error, setError] = useState('');

  const submit = () => {
    if (!form.company.trim()) return setError('Firma adı zorunludur.');
    addCustomer({
      company: form.company.trim(),
      contact: form.contact,
      phone: form.phone,
      email: form.email,
      address: form.address,
      taxOffice: form.taxOffice,
      taxNo: form.taxNo,
      note: form.note,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'aktif',
    });
    toast.success('Müşteri eklendi.');
    setOpen(false);
    setForm({ company: '', contact: '', phone: '', email: '', address: '', taxOffice: '', taxNo: '', note: '', tags: '' });
    setError('');
  };

  return (
    <div>
      <PageHeader
        title="Müşteriler"
        subtitle={`${db.customers.filter((c) => c.status === 'aktif').length} aktif müşteri`}
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 size-4" /> Müşteri Ekle</Button>}
      />

      {db.customers.length === 0 ? (
        <EmptyState title="Henüz müşteri bulunmuyor." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {db.customers.map((c) => {
            const total = db.jobs.filter((j) => j.customerId === c.id).reduce((s, j) => s + j.fee, 0);
            const activeJobs = db.jobs.filter((j) => j.customerId === c.id && !['tamamlandi', 'iptal'].includes(j.status)).length;
            return (
              <Link key={c.id} to={`/musteriler/${c.id}`} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary"><Building2 className="size-4 text-muted-foreground" /></span>
                    <h3 className="font-semibold">{c.company}</h3>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.status === 'aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                    {c.status === 'aktif' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.contact}</p>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span>{activeJobs} aktif iş</span>
                  <span className="font-mono-num">Toplam: {formatTL(total)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Müşteri Ekle</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label>Firma adı *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Yetkili kişi</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
            <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>E-posta</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Adres</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Vergi dairesi</Label><Input value={form.taxOffice} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} /></div>
            <div><Label>Vergi no</Label><Input value={form.taxNo} onChange={(e) => setForm({ ...form, taxNo: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Etiketler</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="virgülle ayırın" /></div>
            <div className="sm:col-span-2"><Label>Not</Label><Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
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

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, deleteCustomer, updateCustomer, currentRole } = useApp();
  const [confirm, setConfirm] = useState(false);
  const c = db.customers.find((x) => x.id === id);
  if (!c) return <p className="py-20 text-center text-muted-foreground">Müşteri bulunamadı.</p>;

  const jobs = db.jobs.filter((j) => j.customerId === c.id);
  const activeJobs = jobs.filter((j) => !['tamamlandi', 'iptal'].includes(j.status));
  const pastJobs = jobs.filter((j) => ['tamamlandi', 'iptal'].includes(j.status));
  const projects = db.projects.filter((p) => p.customerId === c.id);
  const total = jobs.reduce((s, j) => s + j.fee, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{c.company}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{c.contact}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={c.status} onValueChange={(v) => updateCustomer(c.id, { status: v as 'aktif' | 'pasif' })}>
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pasif">Pasif</SelectItem>
              </SelectContent>
            </Select>
            {currentRole === 'yonetici' && (
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirm(true)}>Sil</Button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 border-t pt-4 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2"><Phone className="size-4" /> {c.phone || '—'}</span>
          <span className="flex items-center gap-2"><Mail className="size-4" /> {c.email || '—'}</span>
          <span className="flex items-center gap-2 sm:col-span-2"><MapPin className="size-4 shrink-0" /> {c.address || '—'}</span>
          <span>Vergi: {c.taxOffice} / {c.taxNo}</span>
          <span className="font-mono-num font-semibold text-foreground">Toplam iş tutarı: {formatTL(total)}</span>
        </div>
        {c.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">#{t}</span>)}
          </div>
        )}
        {c.note && <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Aktif İşler ({activeJobs.length})</h2>
          {activeJobs.length === 0 ? <p className="text-sm text-muted-foreground">Aktif iş yok.</p> : (
            <ul className="divide-y text-sm">
              {activeJobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link to={`/isler/${j.id}`} className="font-medium hover:text-primary hover:underline">{j.title}</Link>
                  <StatusBadge status={j.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Geçmiş İşler ({pastJobs.length})</h2>
          {pastJobs.length === 0 ? <p className="text-sm text-muted-foreground">Geçmiş iş yok.</p> : (
            <ul className="divide-y text-sm">
              {pastJobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2 py-2.5">
                  <Link to={`/isler/${j.id}`} className="font-medium hover:text-primary hover:underline">{j.title}</Link>
                  <StatusBadge status={j.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Projeler ({projects.length})</h2>
        {projects.length === 0 ? <p className="text-sm text-muted-foreground">Proje yok.</p> : (
          <ul className="divide-y text-sm">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                <Link to={`/projeler/${p.id}`} className="font-medium hover:text-primary hover:underline">{p.name}</Link>
                <span className="flex items-center gap-3">
                  <span className="font-mono-num text-xs text-muted-foreground">{formatTL(p.budget)}</span>
                  <ProjectStatusBadge status={p.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Müşteri silinsin mi?"
        description={`${c.company} silinecek. Müşteriye bağlı işler ve projeler silinmez.`}
        onConfirm={() => {
          deleteCustomer(c.id);
          toast.success('Müşteri silindi.');
          navigate('/musteriler');
        }}
      />
    </div>
  );
}
