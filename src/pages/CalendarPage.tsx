import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Trash2, Users } from 'lucide-react';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { useApp } from '@/store/AppContext';
import { PageHeader, Avatar } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type View = 'ay' | 'hafta' | 'gun';

export default function CalendarPage() {
  const { db, employee, customer, addMeeting, deleteMeeting } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('ay');
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [mForm, setMForm] = useState({ title: '', time: '10:00', location: '', customerId: '', description: '', note: '', participants: [] as string[] });
  const [mError, setMError] = useState('');

  const days = useMemo(() => {
    if (view === 'ay') {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
      const out: Date[] = [];
      for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
      return out;
    }
    if (view === 'hafta') {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    return [cursor];
  }, [view, cursor]);

  const jobsOn = (day: Date) => db.jobs.filter((j) => isSameDay(parseISO(j.dueDate), day) && j.status !== 'iptal');
  const meetingsOn = (day: Date) => db.meetings.filter((m) => isSameDay(parseISO(m.date), day));

  const move = (dir: 1 | -1) => {
    setCursor((c) => (view === 'ay' ? addMonths(c, dir) : view === 'hafta' ? addWeeks(c, dir) : addDays(c, dir)));
  };

  const title =
    view === 'ay'
      ? format(cursor, 'MMMM yyyy', { locale: tr })
      : view === 'hafta'
        ? `${format(days[0], 'd MMM', { locale: tr })} — ${format(days[6], 'd MMM yyyy', { locale: tr })}`
        : format(cursor, 'd MMMM yyyy, EEEE', { locale: tr });

  const submitMeeting = () => {
    if (!mForm.title.trim()) return setMError('Toplantı adı zorunludur.');
    addMeeting({
      title: mForm.title.trim(),
      date: format(selected, 'yyyy-MM-dd'),
      time: mForm.time,
      participantIds: mForm.participants,
      customerId: mForm.customerId || null,
      location: mForm.location,
      description: mForm.description,
      note: mForm.note,
    });
    toast.success('Toplantı oluşturuldu.');
    setMeetingOpen(false);
    setMForm({ title: '', time: '10:00', location: '', customerId: '', description: '', note: '', participants: [] });
    setMError('');
  };

  return (
    <div>
      <PageHeader
        title="Takvim"
        subtitle="İşler, toplantılar ve teslim tarihleri"
        actions={<Button onClick={() => setMeetingOpen(true)}><Plus className="mr-1.5 size-4" /> Toplantı Oluştur</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-card">
          <button onClick={() => move(-1)} className="p-2 hover:bg-secondary rounded-l-lg" aria-label="Önceki"><ChevronLeft className="size-4" /></button>
          <span className="min-w-40 text-center text-sm font-semibold capitalize">{title}</span>
          <button onClick={() => move(1)} className="p-2 hover:bg-secondary rounded-r-lg" aria-label="Sonraki"><ChevronRight className="size-4" /></button>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}>Bugün</Button>
        <div className="ml-auto flex rounded-lg border bg-card p-0.5">
          {([['ay', 'Aylık'], ['hafta', 'Haftalık'], ['gun', 'Günlük']] as [View, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium', view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {view === 'ay' && (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border text-sm">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
            <div key={d} className="bg-secondary/70 px-2 py-1.5 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {days.map((day) => {
            const items = [...meetingsOn(day).map((m) => ({ kind: 'm' as const, m })), ...jobsOn(day).map((j) => ({ kind: 'j' as const, j }))];
            return (
              <button
                key={day.toISOString()}
                onClick={() => { setSelected(day); setView('gun'); setCursor(day); }}
                className={cn(
                  'flex min-h-20 flex-col items-stretch gap-1 bg-card p-1.5 text-left sm:min-h-24',
                  !isSameMonth(day, cursor) && 'opacity-40',
                  isToday(day) && 'ring-2 ring-inset ring-primary'
                )}
              >
                <span className={cn('self-start rounded-full px-1.5 text-xs font-mono-num', isToday(day) ? 'bg-primary font-bold text-primary-foreground' : 'text-muted-foreground')}>
                  {format(day, 'd')}
                </span>
                {items.slice(0, 3).map((it) =>
                  it.kind === 'j' ? (
                    <span key={it.j.id} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary">
                      {it.j.time ? `${it.j.time} ` : ''}{it.j.title}
                    </span>
                  ) : (
                    <span key={it.m.id} className="truncate rounded bg-violet-100 px-1 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {it.m.time} {it.m.title}
                    </span>
                  )
                )}
                {items.length > 3 && <span className="text-[10px] text-muted-foreground">+{items.length - 3} daha</span>}
              </button>
            );
          })}
        </div>
      )}

      {view !== 'ay' && (
        <div className="space-y-3">
          {days.map((day) => {
            const js = jobsOn(day);
            const ms = meetingsOn(day);
            return (
              <div key={day.toISOString()} className="rounded-xl border bg-card p-4">
                <h3 className={cn('mb-2 text-sm font-semibold capitalize', isToday(day) && 'text-primary')}>
                  {format(day, 'd MMMM yyyy, EEEE', { locale: tr })}
                </h3>
                {js.length === 0 && ms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Bu gün için planlanmış öğe yok.</p>
                ) : (
                  <div className="space-y-2">
                    {ms.map((m) => (
                      <div key={m.id} className="rounded-lg border-l-4 border-violet-500 bg-secondary/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono-num text-xs text-muted-foreground">{m.time}</span>
                            <span className="ml-2 font-medium">{m.title}</span>
                            {m.location && <span className="ml-2 text-xs text-muted-foreground">📍 {m.location}</span>}
                          </div>
                          <button onClick={() => setConfirmId(m.id)} className="text-muted-foreground hover:text-destructive" aria-label="Toplantıyı sil">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
                        {m.participantIds.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            {m.participantIds.map((pid) => employee(pid)?.name.split(' ')[0]).filter(Boolean).join(', ')}
                          </div>
                        )}
                        {m.customerId && <p className="mt-1 text-xs text-muted-foreground">Müşteri: {customer(m.customerId)?.company}</p>}
                      </div>
                    ))}
                    {js.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => navigate(`/isler/${j.id}`)}
                        className="block w-full rounded-lg border-l-4 border-primary bg-secondary/50 p-3 text-left hover:bg-secondary"
                      >
                        <span className="font-mono-num text-xs text-muted-foreground">{j.time || '—'}</span>
                        <span className="ml-2 font-medium">{j.title}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{employee(j.assigneeId)?.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toplantı oluşturma */}
      <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>Toplantı Oluştur</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Toplantı adı *</Label><Input value={mForm.title} onChange={(e) => setMForm({ ...mForm, title: e.target.value })} placeholder="Örn: ABC Ltd. Toplantısı" /></div>
            <div><Label>Tarih</Label><Input type="date" value={format(selected, 'yyyy-MM-dd')} onChange={(e) => setSelected(parseISO(e.target.value))} /></div>
            <div><Label>Saat</Label><Input type="time" value={mForm.time} onChange={(e) => setMForm({ ...mForm, time: e.target.value })} /></div>
            <div><Label>Müşteri</Label>
              <Select value={mForm.customerId} onValueChange={(v) => setMForm({ ...mForm, customerId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Seçin (opsiyonel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {db.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Konum</Label><Input value={mForm.location} onChange={(e) => setMForm({ ...mForm, location: e.target.value })} placeholder="Ofis / Online" /></div>
            <div className="sm:col-span-2">
              <Label>Katılımcılar</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {db.employees.filter((e) => e.active).map((e) => (
                  <label key={e.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={mForm.participants.includes(e.id)}
                      onCheckedChange={(v) =>
                        setMForm((f) => ({ ...f, participants: v ? [...f.participants, e.id] : f.participants.filter((x) => x !== e.id) }))
                      }
                    />
                    <Avatar name={e.name} color={e.color} size="sm" />
                    {e.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2"><Label>Açıklama</Label><Textarea rows={2} value={mForm.description} onChange={(e) => setMForm({ ...mForm, description: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Not</Label><Input value={mForm.note} onChange={(e) => setMForm({ ...mForm, note: e.target.value })} /></div>
          </div>
          {mError && <p className="mt-3 text-sm font-medium text-destructive">{mError}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMeetingOpen(false)}>Vazgeç</Button>
            <Button onClick={submitMeeting}>Oluştur</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Toplantı silinsin mi?"
        onConfirm={() => {
          if (confirmId) deleteMeeting(confirmId);
          setConfirmId(null);
          toast.success('Toplantı silindi.');
        }}
      />
    </div>
  );
}