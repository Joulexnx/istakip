import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useApp } from '@/store/AppContext';
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER, PRIORITY_LABELS } from '@/types/models';
import type { Job, Priority } from '@/types/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface JobFormValues {
  title: string;
  description: string;
  customerId: string;
  projectId: string;
  assigneeId: string;
  startDate: string;
  dueDate: string;
  time: string;
  priority: Priority;
  status: Job['status'];
  fee: string;
  cost: string;
  tags: string;
  note: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function emptyJobForm(defaults?: Partial<JobFormValues>): JobFormValues {
  return {
    title: '',
    description: '',
    customerId: '',
    projectId: '',
    assigneeId: '',
    startDate: today(),
    dueDate: today(),
    time: '',
    priority: 'orta',
    status: 'yeni',
    fee: '',
    cost: '',
    tags: '',
    note: '',
    ...defaults,
  };
}

export function JobFormModal({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaults?: Partial<JobFormValues>;
}) {
  const { db, addJob } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<JobFormValues>(emptyJobForm(defaults));
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(emptyJobForm(defaults));
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof JobFormValues>(k: K, v: JobFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const projectsForCustomer = db.projects.filter((p) => !form.customerId || p.customerId === form.customerId);
  const activeEmployees = db.employees.filter((e) => e.active);

  const submit = () => {
    if (!form.title.trim()) return setError('İş adı zorunludur.');
    if (!form.assigneeId) return setError('Sorumlu çalışan seçiniz.');
    if (!form.customerId) return setError('Müşteri seçiniz.');
    const job = addJob({
      title: form.title.trim(),
      description: form.description.trim(),
      customerId: form.customerId,
      projectId: form.projectId || null,
      assigneeId: form.assigneeId,
      startDate: form.startDate,
      dueDate: form.dueDate,
      time: form.time,
      priority: form.priority,
      status: form.status,
      fee: Number(form.fee) || 0,
      cost: Number(form.cost) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      note: form.note.trim(),
    });
    toast.success('İş başarıyla oluşturuldu.');
    onOpenChange(false);
    navigate(`/isler/${job.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni İş Oluştur</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>İş adı *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Örn: Web tasarımı" />
          </div>
          <div className="sm:col-span-2">
            <Label>Açıklama</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="İşin ayrıntıları..." />
          </div>
          <div>
            <Label>Müşteri *</Label>
            <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v, projectId: '' }))}>
              <SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
              <SelectContent>
                {db.customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Proje</Label>
            <Select value={form.projectId} onValueChange={(v) => set('projectId', v)}>
              <SelectTrigger><SelectValue placeholder="Proje seçin (opsiyonel)" /></SelectTrigger>
              <SelectContent>
                {projectsForCustomer.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sorumlu çalışan *</Label>
            <Select value={form.assigneeId} onValueChange={(v) => set('assigneeId', v)}>
              <SelectTrigger><SelectValue placeholder="Çalışan seçin" /></SelectTrigger>
              <SelectContent>
                {activeEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Öncelik</Label>
            <Select value={form.priority} onValueChange={(v) => set('priority', v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Başlangıç tarihi</Label>
            <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div>
            <Label>Teslim tarihi</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div>
            <Label>Saat</Label>
            <Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
          </div>
          <div>
            <Label>Durum</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v as Job['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {JOB_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tahmini ücret (₺)</Label>
            <Input type="number" min={0} value={form.fee} onChange={(e) => set('fee', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Tahmini maliyet (₺)</Label>
            <Input type="number" min={0} value={form.cost} onChange={(e) => set('cost', e.target.value)} placeholder="0" />
          </div>
          <div className="sm:col-span-2">
            <Label>Etiketler</Label>
            <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="virgülle ayırın: tasarım, web" />
          </div>
          <div className="sm:col-span-2">
            <Label>Not</Label>
            <Textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={2} />
          </div>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Vazgeç</Button>
          <Button onClick={submit}>İşi Oluştur</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
