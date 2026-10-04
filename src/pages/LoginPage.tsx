import { useState, type FormEvent } from 'react';
import { BriefcaseBusiness, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store/AppContext';
import { Avatar } from '@/components/common/Basics';
import { ROLE_LABELS } from '@/types/models';

export default function LoginPage() {
  const { db, login } = useApp();
  const [email, setEmail] = useState(db.employees.find((e) => e.role === 'yonetici' && e.active)?.email ?? '');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Giriş yapılamadı.');
      return;
    }
    toast.success('Giriş başarılı.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <section className="hidden flex-1 flex-col justify-between bg-sidebar p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary">
                <BriefcaseBusiness className="size-6" />
              </span>
              <div>
                <p className="text-lg font-bold">İş Takip</p>
                <p className="text-xs text-sidebar-foreground">Yönetim ve operasyon</p>
              </div>
            </div>
            <div className="mt-24 max-w-md">
              <h1 className="text-4xl font-bold tracking-tight">Ekibinin bütün işlerini tek yerde yönet.</h1>
              <p className="mt-5 text-base leading-7 text-sidebar-foreground">
                İşler, projeler, müşteriler, takvim, finans ve ekip yönetimi tek panelde.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground">
            <ShieldCheck className="size-4" /> Oturum yönetimi
          </div>
        </section>

        <main className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-[480px] lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BriefcaseBusiness className="size-5" />
                </span>
                <span className="font-bold">İş Takip</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">Hoş geldin</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hesabına giriş yaparak devam et.</p>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">E-posta</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="h-11 w-full rounded-lg border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Şifre</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-11 w-full rounded-lg border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-semibold">Geliştirme / demo hesabı</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bu sürümde giriş akışı demo kullanıcılarıyla çalışır. Gerçek sunucu kimlik doğrulaması sonraki backend adımında bağlanacaktır.
              </p>
              <div className="mt-3 space-y-1.5">
                {db.employees.filter((e) => e.active).slice(0, 4).map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setEmail(employee.email)}
                    className="flex w-full items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-left hover:bg-secondary"
                  >
                    <Avatar name={employee.name} color={employee.color} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{employee.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{ROLE_LABELS[employee.role]}</span>
                    </span>
                    <span className="text-[10px] text-primary">Seç</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">Demo şifre: 123456</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
