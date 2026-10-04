import { AlertTriangle, Bell, CheckCheck, Info } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatDateTime } from '@/lib/format';
import { PageHeader, EmptyState } from '@/components/common/Basics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const { db, markNotificationRead, markAllNotificationsRead } = useApp();
  const unread = db.notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Bildirimler"
        subtitle={unread > 0 ? `${unread} okunmamış bildirim` : 'Tüm bildirimler okundu'}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
              <CheckCheck className="mr-1.5 size-4" /> Tümünü okundu say
            </Button>
          ) : undefined
        }
      />

      {db.notifications.length === 0 ? (
        <EmptyState title="Henüz bildirim bulunmuyor." hint="İş atamaları, teslim tarihi yaklaşan işler ve yorumlar burada listelenir." />
      ) : (
        <ul className="space-y-2">
          {db.notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => markNotificationRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-shadow hover:shadow-sm',
                  !n.read && 'border-l-4 border-l-primary'
                )}
              >
                <span className={cn('mt-0.5', n.kind === 'uyari' ? 'text-amber-500' : 'text-primary')}>
                  {n.kind === 'uyari' ? <AlertTriangle className="size-5" /> : <Bell className="size-5" />}
                </span>
                <span className="flex-1">
                  <span className={cn('block text-sm', !n.read && 'font-semibold')}>{n.text}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-mono-num">
                    <Info className="size-3" /> {formatDateTime(n.createdAt)}
                  </span>
                </span>
                {!n.read && <span className="mt-1 size-2 rounded-full bg-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}