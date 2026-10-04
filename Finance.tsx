import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownCircle, ArrowUpCircle, Plus, Scale, Trash2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDate, formatTL } from '@/lib/format';
import { PageHeader, StatCard, EmptyState } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TransactionType } from '@/types/models';

const GELIR_KATEGORI = ['Hakediş', 'Avans', 'Teslim', 'Bakım', 'Danışmanlık', 'Diğer'];
const GIDER_KATEGORI = ['Kira', 'Altyapı', 'Yazılım', 'Dış kaynak', 'Operasyon', 'Personel', 'Diğer'];

export default function Finance() {
  const { db, customer, project, addTransaction, deleteTransaction } = useApp();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('gelir');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), customerId: '', projectId: '', category: '' });
  const [error, setError] = useState('');

  const month = new Date().toISOString().slice(0, 7);
  const monthly = useMemo(() => {
    const gelir = db.transactions.filter((t) => t.type === 'gelir' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
    const gider = db.transactions.filter((t) => t.type === 'gider' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
    return { gelir, gider, net: gelir - gider };
  }, [db.transactions, month]);

  const openDialog = (t: TransactionType) => {
    setType(t);
    setForm({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), customerId: '', projectId: '', category: '' });
    setError('');
    setOpen(true);
  };

  const submit = () => {
    if (!form.description.trim()) return setError('Açıklama zorunludur.');
    if (!Number(form.amount)) return setError('Geçerli bir tutar giriniz.');
    addTransaction({
      type,
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date,
      customerId: form.customerId || null,
      projectId: form.projectId || null,
      category: form.category || 'Diğer',
    });
    toast.success(type === 'gelir' ? 'Gelir kaydedildi.' : 'Gider kaydedildi.');
    setOpen(false);
  };

  const kategoriler = type === 'gelir' ? GELIR_KATEGORI : GIDER_KATEGORI;

  return (
    <div>
      <PageHeader
        title="Gelir / Gider"
        subtitle="Şirket finans hareketleri"
        actions={
          <>
            <Button variant="outline" onClick={() => openDialog('gider')}><ArrowDownCircle className="mr-1.5 size-4 text-red-500" /> Gider Ekle</Button>
            <Button onClick={() => openDialog('gelir')}><ArrowUpCircle className="mr-1.5 size-4" /> Gelir Ekle</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Bu Ay — Gelir" value={formatTL(monthly.gelir)} icon={ArrowUpCircle} tone="success" />
        <StatCard label="Bu Ay — Gider" value={formatTL(monthly.gider)} icon={ArrowDownCircle} tone="danger" />
        <StatCard label="Bu Ay — Net" value={formatTL(monthly.net)} icon={Scale} tone={monthly.net >= 0 ? 'success' : 'danger'} />
      </div>

      <div className="mt-5 rounded-xl border bg-card">
        <h2 className="border-b px-5 py-3 text-sm font-semibold">Hareketler</h2>
        {db.transactions.length === 0 ? (
          <div className="p-5"><EmptyState title="Henüz finans hareketi yok." /></div>
        ) : (
          <ul className="divide-y text-sm">
            {[...db.transactions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={`flex size-8 items-center justify-center rounded-full ${t.type === 'gelir' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15' : 'bg-red-100 text-red-600 dark:bg-red-500/15'}`}>
                    {t.type === 'gelir' ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.category}
                      {customer(t.customerId) ? ` • ${customer(t.customerId)?.company}` : ''}
                      {project(t.projectId) ? ` • ${project(t.projectId)?.name}` : ''}
                    </div>
                  </div>
                  <span className="font-mono-num text-xs text-muted-foreground">{formatDate(t.date)}</span>
                  <span className={`font-mono-num font-semibold ${t.type === 'gelir' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'gelir' ? '+' : '−'}{formatTL(t.amount)}
                  </span>
                  <button onClick={() => setConfirmId(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Kaydı sil">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {type === 'gelir' ? 'Gelir Ekle' : 'Gider Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Açıklama *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tutar (₺) *</Label><Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Tarih</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                <SelectContent>{kategoriler.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Müşteri</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Seçin (opsiyonel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {db.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Proje</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Seçin (opsiyonel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {db.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
              <Button onClick={submit}>Kaydet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Kayıt silinsin mi?"
        onConfirm={() => {
          if (confirmId) deleteTransaction(confirmId);
          setConfirmId(null);
          toast.success('Kayıt silindi.');
        }}
      />
    </div>
  );
}
