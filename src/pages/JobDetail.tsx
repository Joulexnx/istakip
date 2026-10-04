import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip, Plus, Send, Trash2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDate, formatDateLong, formatDateTime, formatTL, isOverdue } from '@/lib/format';
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER, PRIORITY_LABELS } from '@/types/models';
import type { JobStatus, Priority } from '@/types/models';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { Avatar, ProgressBar } from '@/components/common/Basics';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FILE_ICONS: Record<string, string> = { pdf: '📎', jpg: '📷', png: '📷', docx: '📄', xlsx: '📊', diger: '📎' };

export default function JobDetail() {
  const { id } = useParams();
  const { db, employee, customer, project, setJobStatus, toggleSubtask, addSubtask, addComment, addFile, deleteJob, currentRole, currentUserId, updateJob } = useApp();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [newSub, setNewSub] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const job = db.jobs.find((j) => j.id === id);
  if (!job) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">İş bulunamadı.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/isler')}>İş listesine dön</Button>
      </div>
    );
  }

  const doneCount = job.subtasks.filter((s) => s.done).length;
  const progress = job.subtasks.length ? Math.round((doneCount / job.subtasks.length) * 100) : 0;
  const overdue = isOverdue(job.dueDate, job.status);
  const canDelete = currentRole === 'yonetici';
  const canAccessJob = currentRole !== 'calisan' || job.assigneeId === currentUserId;

  if (!canAccessJob) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-lg font-semibold">Bu işe erişim yetkiniz yok.</p>
        <p className="mt-2 text-sm text-muted-foreground">Çalışan hesabıyla yalnızca size atanan işler görüntülenebilir.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/isler')}>İşlerime dön</Button>
      </div>
    );
  }

  const submitComment = () => {
    if (!comment.trim()) return;
    addComment(job.id, comment.trim());
    setComment('');
    toast.success('Yorum eklendi.');
  };

  const submitSub = () => {
    if (!newSub.trim()) return;
    addSubtask(job.id, newSub.trim());
    setNewSub('');
  };

  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.docx,.xlsx';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) {
        addFile(job.id, f.name);
        toast.success('Dosya eklendi.');
      }
    };
    input.click();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Geri
      </button>

      {/* Üst bölüm */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
              {overdue && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  Teslim tarihi geçti
                </span>
              )}
            </div>
          </div>
          {canDelete && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-1.5 size-4" /> Sil
            </Button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <span className="block text-xs text-muted-foreground">Sorumlu</span>
            <span className="mt-1 flex items-center gap-2 font-medium">
              <Avatar name={employee(job.assigneeId)?.name ?? '?'} color={employee(job.assigneeId)?.color} size="sm" />
              {employee(job.assigneeId)?.name}
            </span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Müşteri</span>
            <Link to={`/musteriler/${job.customerId}`} className="mt-1 block font-medium hover:text-primary hover:underline">
              {customer(job.customerId)?.company}
            </Link>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Proje</span>
            <span className="mt-1 block font-medium">
              {project(job.projectId) ? (
                <Link to={`/projeler/${job.projectId}`} className="hover:text-primary hover:underline">{project(job.projectId)?.name}</Link>
              ) : '—'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Başlangıç</span>
            <span className="mt-1 block font-medium font-mono-num">{formatDate(job.startDate)}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Teslim</span>
            <span className={`mt-1 block font-medium font-mono-num ${overdue ? 'text-red-600' : ''}`}>
              {formatDateLong(job.dueDate)}{job.time ? ` — ${job.time}` : ''}
            </span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">Durum değiştir</span>
            <Select value={job.status} onValueChange={(v) => { setJobStatus(job.id, v as JobStatus); toast.success('İş durumu güncellendi.'); }}>
              <SelectTrigger className="mt-1 h-8 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {JOB_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(job.fee > 0 || job.cost > 0) && currentRole !== 'calisan' && (
          <div className="mt-4 flex flex-wrap gap-6 border-t pt-4 text-sm">
            <div><span className="text-muted-foreground">Ücret:</span> <span className="font-mono-num font-semibold">{formatTL(job.fee)}</span></div>
            <div><span className="text-muted-foreground">Maliyet:</span> <span className="font-mono-num font-semibold">{formatTL(job.cost)}</span></div>
            <div><span className="text-muted-foreground">Kâr:</span> <span className="font-mono-num font-semibold text-emerald-600">{formatTL(job.fee - job.cost)}</span></div>
          </div>
        )}

        {job.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Sol sütun */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Açıklama</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{job.description || 'Açıklama eklenmemiş.'}</p>
            {job.note && (
              <>
                <h2 className="mt-4 text-sm font-semibold">Not</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{job.note}</p>
              </>
            )}
          </div>

          {/* Alt görevler */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Alt Görevler</h2>
              {job.subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">{doneCount} / {job.subtasks.length} tamamlandı</span>
              )}
            </div>
            {job.subtasks.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={progress} className="flex-1" />
                <span className="font-mono-num text-sm font-semibold text-primary">%{progress}</span>
              </div>
            )}
            <div className="mt-3 space-y-2">
              {job.subtasks.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox checked={s.done} onCheckedChange={() => toggleSubtask(job.id, s.id)} />
                  <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.title}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSub()}
                placeholder="Yeni alt görev..."
                className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
              <Button size="sm" variant="outline" onClick={submitSub}><Plus className="size-4" /></Button>
            </div>
          </div>
        </div>

        {/* Sağ sütun */}
        <div className="space-y-4">
          {/* Dosyalar */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Dosyalar ve Fotoğraflar</h2>
              <Button size="sm" variant="outline" onClick={pickFile}><Paperclip className="mr-1.5 size-3.5" /> Dosya Ekle</Button>
            </div>
            {job.files.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Henüz dosya eklenmemiş.</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm">
                {job.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
                    <span>{FILE_ICONS[f.kind]}</span>
                    <span className="truncate">{f.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Yorumlar */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Yorumlar ve Notlar</h2>
            <div className="mt-3 space-y-3">
              {job.comments.length === 0 && <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>}
              {job.comments.map((c) => {
                const u = employee(c.userId);
                return (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar name={u?.name ?? '?'} color={u?.color} size="sm" />
                    <div className="min-w-0 flex-1 rounded-lg bg-secondary/60 px-3 py-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{u?.name ?? 'Bilinmiyor'}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground font-mono-num">{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder={`${employee(currentUserId)?.name ?? ''} olarak yorum yaz...`}
                className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
              <Button size="sm" onClick={submitComment}><Send className="size-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Öncelik düzenleme (hızlı) */}
      {currentRole !== 'calisan' && (
        <div className="mt-4 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Öncelik</h2>
        <div className="mt-2 flex gap-2">
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => updateJob(job.id, { priority: p })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${job.priority === p ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-secondary'}`}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="İş silinsin mi?"
        description={`"${job.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={() => {
          deleteJob(job.id);
          toast.success('İş silindi.');
          navigate('/isler');
        }}
      />
    </div>
  );
}