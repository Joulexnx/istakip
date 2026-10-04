import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Database, Download, Moon, Plus, RefreshCcw, Sun, Trash2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PageHeader } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { db, updateSettings, addDepartment, resetDemo, clearAllData, exportData } = useApp();
  const [company, setCompany] = useState(db.settings);
  const [newDept, setNewDept] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearText, setClearText] = useState('');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Ayarlar" subtitle="Şirket, sistem ve veri yönetimi" />

      {/* Şirket ayarları */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4" /> Şirket Ayarları</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Şirket adı</Label>
            <Input value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
          </div>
          <div>
            <Label>Adres</Label>
            <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => { updateSettings(company); toast.success('Şirket ayarları kaydedildi.'); }}>Kaydet</Button>
        </div>
      </section>

      {/* Sistem ayarları */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {db.settings.theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />} Sistem Ayarları
        </h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between text-sm">
            <span>
              <span className="block font-medium">Koyu tema</span>
              <span className="text-xs text-muted-foreground">Arayüzü koyu renklerde görüntüle</span>
            </span>
            <Switch
              checked={db.settings.theme === 'dark'}
              onCheckedChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
            />
          </label>
          <div className="flex items-center justify-between text-sm">
            <span>
              <span className="block font-medium">Para birimi</span>
              <span className="text-xs text-muted-foreground">Tüm tutarlar bu para biriminde gösterilir</span>
            </span>
            <span className="rounded-lg bg-secondary px-3 py-1.5 font-mono-num text-sm font-semibold">₺ Türk Lirası</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>
              <span className="block font-medium">Tarih formatı</span>
            </span>
            <span className="rounded-lg bg-secondary px-3 py-1.5 font-mono-num text-sm font-semibold">GG.AA.YYYY</span>
          </div>
        </div>
      </section>

      {/* Departmanlar */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Departmanlar</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {db.departments.map((d) => (
            <span key={d.id} className="rounded-full bg-secondary px-3 py-1 text-sm">{d.name}</span>
          ))}
          {db.departments.length === 0 && <span className="text-sm text-muted-foreground">Departman tanımlı değil.</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="Yeni departman adı" className="max-w-60" />
          <Button
            variant="outline"
            onClick={() => {
              if (!newDept.trim()) return;
              addDepartment(newDept.trim());
              setNewDept('');
              toast.success('Departman eklendi.');
            }}
          >
            <Plus className="mr-1.5 size-4" /> Ekle
          </Button>
        </div>
      </section>

      {/* Veri yönetimi */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Database className="size-4" /> Veri Yönetimi</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={() => { exportData(); toast.success('Yedek dosyası indirildi.'); }}>
            <Download className="mr-1.5 size-4" /> Verileri Dışa Aktar
          </Button>
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RefreshCcw className="mr-1.5 size-4" /> Demo Verilerini Yükle
          </Button>
          <Button variant="outline" className="text-destructive" onClick={() => { setClearText(''); setConfirmClear(true); }}>
            <Trash2 className="mr-1.5 size-4" /> Tüm Verileri Sil
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Veriler şu anda bu tarayıcıda saklanmaktadır. Dışa aktarım, tüm verilerinizi JSON yedeği olarak indirir.
        </p>
      </section>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Demo verileri yüklensin mi?"
        description="Mevcut tüm veriler silinip örnek şirket verileri yeniden yüklenecek."
        confirmLabel="Evet, yükle"
        onConfirm={() => {
          resetDemo();
          setCompany({ ...db.settings });
          toast.success('Demo veriler yüklendi.');
        }}
      />

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tüm veriler silinsin mi?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            İşler, projeler, müşteriler, çalışanlar ve tüm kayıtlar kalıcı olarak silinecek. Bu işlem geri alınamaz.
            Devam etmek için aşağıya <strong>SİL</strong> yazın.
          </p>
          <Input value={clearText} onChange={(e) => setClearText(e.target.value)} placeholder="SİL" autoFocus />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmClear(false)}>Vazgeç</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (clearText !== 'SİL') {
                  toast.error('Onay için SİL yazmalısınız.');
                  return;
                }
                clearAllData();
                setConfirmClear(false);
                toast.success('Tüm veriler silindi.');
              }}
            >
              Kalıcı olarak sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
