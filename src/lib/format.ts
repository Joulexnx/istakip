// Para ve tarih biçimlendirme yardımcıları
import { format, parseISO, isToday, isBefore, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

const tl = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export function formatTL(amount: number): string {
  return tl.format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd.MM.yyyy');
  } catch {
    return iso;
  }
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'd MMMM yyyy', { locale: tr });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd.MM.yyyy HH:mm');
  } catch {
    return iso;
  }
}

export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'tamamlandi' || status === 'iptal') return false;
  try {
    return isBefore(parseISO(dueDate), new Date()) && !isToday(parseISO(dueDate));
  } catch {
    return false;
  }
}

export function isDueToday(date: string): boolean {
  try {
    return isToday(parseISO(date));
  } catch {
    return false;
  }
}

export function isDueTomorrow(date: string): boolean {
  try {
    return isSameDay(parseISO(date), addDays(new Date(), 1));
  } catch {
    return false;
  }
}

export function daysDiff(fromISO: string, toISO: string): number {
  const a = parseISO(fromISO).getTime();
  const b = parseISO(toISO).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

let seq = 0;
export function uid(prefix = 'id'): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}