# İş Takip — Supabase altyapısı

Bu klasör, İş Takip'in localStorage tabanlı demo veri katmanından gerçek PostgreSQL/Supabase altyapısına geçiş için migration dosyalarını içerir.

## Mimari

- Supabase Auth: gerçek e-posta/şifre oturumu
- PostgreSQL: kalıcı veritabanı
- RLS (Row Level Security): her istekte şirket/tenant izolasyonu
- user_accounts: Auth kullanıcısını şirkete ve uygulama rolüne bağlar
- system_admins: gelecekteki sistem yöneticisi paneli için tenant dışı yetki katmanı

## Uygulama sırası

1. Supabase'de yeni bir proje oluştur.
2. Bu migration'ı yerel Supabase CLI ile test et.
3. Migration'ı remote projeye uygula.
4. Auth kullanıcılarını ve ilk şirket/yönetici hesabını güvenli bir bootstrap işlemiyle oluştur.
5. React uygulamasına Supabase istemcisini bağla.
6. localStorage veri erişimini aşamalı olarak kaldır.
7. RLS testleri ekle.

Migration'ları Git'te tutmak, şema değişikliklerini tekrarlanabilir hale getirir. Supabase CLI ile bekleyen migration'lar remote veritabanına uygulanabilir.

## Güvenlik

Tarayıcıya yalnızca Supabase publishable key konulmalıdır. Secret/service anahtarları istemci koduna veya Vercel'in VITE_* değişkenlerine konulmamalıdır.
