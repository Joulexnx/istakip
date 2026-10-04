import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  Wallet,
  BarChart3,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Basics';
import { ROLE_LABELS } from '@/types/models';
import { formatDateTime } from '@/lib/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/isler', label: 'İşler', icon: Briefcase, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/pano', label: 'Görev Panosu', icon: LayoutGrid, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/projeler', label: 'Projeler', icon: FolderKanban, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/calisanlar', label: 'Çalışanlar', icon: Users, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/musteriler', label: 'Müşteriler', icon: Building2, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/takvim', label: 'Takvim', icon: CalendarDays, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/finans', label: 'Gelir / Gider', icon: Wallet, roles: ['yonetici', 'yardimci'] },
  { to: '/raporlar', label: 'Raporlar', icon: BarChart3, roles: ['yonetici', 'yardimci'] },
  { to: '/bildirimler', label: 'Bildirimler', icon: Bell, roles: ['yonetici', 'yardimci', 'calisan'] },
  { to: '/ayarlar', label: 'Ayarlar', icon: Settings, roles: ['yonetici'] },
] as const;

function GlobalSearch() {
  const { db } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const t = q.trim().toLocaleLowerCase('tr');
    if (t.length < 2) return null;
    return {
      jobs: db.jobs.filter((j) => j.title.toLocaleLowerCase('tr').includes(t)).slice(0, 4),
      customers: db.customers.filter((c) => c.company.toLocaleLowerCase('tr').includes(t)).slice(0, 3),
      employees: db.employees.filter((e) => e.name.toLocaleLowerCase('tr').includes(t)).slice(0, 3),
      projects: db.projects.filter((p) => p.name.toLocaleLowerCase('tr').includes(t)).slice(0, 3),
    };
  }, [q, db]);

  const go = (path: string) => {
    setQ('');
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="İş, müşteri, çalışan veya proje ara..."
        className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
      />
      {open && results && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-popover shadow-lg">
            <ScrollArea className="max-h-80">
              {results.jobs.length + results.customers.length + results.employees.length + results.projects.length ===
              0 ? (
                <p className="p-4 text-sm text-muted-foreground">Sonuç bulunamadı.</p>
              ) : (
                <div className="p-1.5 text-sm">
                  {results.jobs.map((j) => (
                    <button key={j.id} onClick={() => go(`/isler/${j.id}`)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-secondary">
                      <Briefcase className="size-4 text-muted-foreground" /> {j.title}
                      <span className="ml-auto text-xs text-muted-foreground">İş</span>
                    </button>
                  ))}
                  {results.customers.map((c) => (
                    <button key={c.id} onClick={() => go(`/musteriler/${c.id}`)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-secondary">
                      <Building2 className="size-4 text-muted-foreground" /> {c.company}
                      <span className="ml-auto text-xs text-muted-foreground">Müşteri</span>
                    </button>
                  ))}
                  {results.employees.map((e) => (
                    <button key={e.id} onClick={() => go(`/calisanlar/${e.id}`)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-secondary">
                      <Users className="size-4 text-muted-foreground" /> {e.name}
                      <span className="ml-auto text-xs text-muted-foreground">Çalışan</span>
                    </button>
                  ))}
                  {results.projects.map((p) => (
                    <button key={p.id} onClick={() => go(`/projeler/${p.id}`)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-secondary">
                      <FolderKanban className="size-4 text-muted-foreground" /> {p.name}
                      <span className="ml-auto text-xs text-muted-foreground">Proje</span>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationBell() {
  const { db, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const unread = db.notifications.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative inline-flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-secondary">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold">Bildirimler</span>
          <button onClick={markAllNotificationsRead} className="text-xs text-primary hover:underline">
            Tümünü okundu say
          </button>
        </div>
        <ScrollArea className="max-h-72">
          {db.notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Henüz bildirim bulunmuyor.</p>
          ) : (
            db.notifications.slice(0, 10).map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  navigate('/bildirimler');
                }}
                className={cn(
                  'flex w-full items-start gap-2.5 border-b px-4 py-2.5 text-left text-sm last:border-0 hover:bg-secondary/60',
                  !n.read && 'bg-primary/5'
                )}
              >
                {n.kind === 'uyari' ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                )}
                <span className="flex-1">
                  {n.text}
                  <span className="mt-0.5 block text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                </span>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const { db, currentUserId, setCurrentUserId } = useApp();
  const me = db.employees.find((e) => e.id === currentUserId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5 hover:bg-secondary">
          <Avatar name={me?.name ?? '?'} color={me?.color} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block max-w-28 truncate text-xs font-semibold leading-tight">{me?.name ?? 'Kullanıcı'}</span>
            <span className="block text-[10px] text-muted-foreground">{ROLE_LABELS[me?.role ?? 'yonetici']}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Rol / kullanıcı değiştir</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {db.employees.map((e) => (
          <DropdownMenuItem key={e.id} onClick={() => setCurrentUserId(e.id)}>
            <Avatar name={e.name} color={e.color} size="sm" />
            <span className="ml-2 flex-1">{e.name}</span>
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[e.role]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children, onNewJob }: { children: React.ReactNode; onNewJob: () => void }) {
  const { db, currentRole } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS.filter((i) => (i.roles as readonly string[]).includes(currentRole));

  return (
    <div className="flex min-h-screen">
      {/* Masaüstü sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-extrabold text-white">
            {db.settings.companyName ? db.settings.companyName.slice(0, 1) : 'Ş'}
          </span>
          <span className="truncate text-sm font-bold text-white">{db.settings.companyName || 'Şirketim'}</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white'
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <UserMenu />
        </div>
      </aside>

      {/* İçerik */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Menü">
            <Menu className="size-5" />
          </button>
          <div className="hidden flex-1 sm:block">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onNewJob}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Yeni İş</span>
            </button>
            <NotificationBell />
            <div className="lg:hidden">
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>

        {/* Mobil alt navigasyon */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
          {[
            { to: '/', label: 'Özet', icon: LayoutDashboard },
            { to: '/isler', label: 'İşler', icon: Briefcase },
            null,
            { to: '/takvim', label: 'Takvim', icon: CalendarDays },
            { to: '/raporlar', label: 'Rapor', icon: BarChart3, roles: ['yonetici', 'yardimci'] },
          ]
            .map((item, i) => {
              if (!item)
                return (
                  <button
                    key="new"
                    onClick={onNewJob}
                    className="-mt-5 flex size-12 items-center justify-center self-start rounded-full bg-primary text-primary-foreground shadow-lg"
                    aria-label="Yeni İş"
                  >
                    <Plus className="size-5" />
                  </button>
                );
              if (item.roles && !(item.roles as string[]).includes(currentRole))
                return <span key={i} className="w-14" />;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex w-16 flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )
                  }
                >
                  <Icon className="size-5" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>
      </div>

      {/* Mobil açılır menü */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border p-4">
            <SheetTitle className="text-left text-white">{db.settings.companyName || 'Şirketim'}</SheetTitle>
          </SheetHeader>
          <nav className="space-y-0.5 p-3">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}