// Demo veriler — ilk açılışta yüklenir. Tarihler gerçek "bugün"e göre üretilir,
// böylece dashboard'daki bugün/geciken hesapları her zaman anlamlı kalır.
import type { DB, Job, JobStatus, Priority } from '@/types/models';
import { addDays, subDays, format } from 'date-fns';

const d = (offset: number): string => format(addDays(new Date(), offset), 'yyyy-MM-dd');
const dp = (offset: number): string => format(subDays(new Date(), -0 + offset * -1), 'yyyy-MM-dd');
const past = (n: number): string => format(subDays(new Date(), n), 'yyyy-MM-dd');
const future = (n: number): string => d(n);
void dp;

const ago = (days: number, hour = 10): string => {
  const t = subDays(new Date(), days);
  t.setHours(hour, (days * 17) % 60, 0, 0);
  return t.toISOString();
};

export function buildDemoDB(): DB {
  const companyId = 'company_demo';

  const departments = [
    { id: 'dep_yonetim', name: 'Yönetim' },
    { id: 'dep_satis', name: 'Satış' },
    { id: 'dep_pazarlama', name: 'Pazarlama' },
    { id: 'dep_muhasebe', name: 'Muhasebe' },
    { id: 'dep_teknik', name: 'Teknik' },
    { id: 'dep_yazilim', name: 'Yazılım' },
    { id: 'dep_ik', name: 'İnsan Kaynakları' },
    { id: 'dep_operasyon', name: 'Operasyon' },
  ];

  const employees = [
    { id: 'emp_ahmet', name: 'Alper', phone: '', email: 'alperoyanik@gmail.com', departmentId: 'dep_yazilim', position: 'Kıdemli Yazılım Geliştirici', startDate: '2022-03-14', active: true, role: 'yonetici' as const, color: '#0d9488' },
    { id: 'emp_mehmet', name: 'Mehmet Kaya', phone: '0533 444 55 66', email: 'mehmet@abcteknoloji.com', departmentId: 'dep_yazilim', position: 'Frontend Geliştirici', startDate: '2023-01-09', active: true, role: 'yardimci' as const, color: '#2563eb' },
    { id: 'emp_ayse', name: 'Ayşe Demir', phone: '0534 777 88 99', email: 'ayse@abcteknoloji.com', departmentId: 'dep_pazarlama', position: 'Grafik Tasarımcı', startDate: '2021-06-21', active: true, role: 'calisan' as const, color: '#db2777' },
    { id: 'emp_can', name: 'Can Öz', phone: '0535 123 45 67', email: 'can@abcteknoloji.com', departmentId: 'dep_teknik', position: 'Sistem Uzmanı', startDate: '2023-09-04', active: true, role: 'calisan' as const, color: '#d97706' },
    { id: 'emp_elif', name: 'Elif Şahin', phone: '0536 987 65 43', email: 'elif@abcteknoloji.com', departmentId: 'dep_satis', position: 'Satış Temsilcisi', startDate: '2024-02-12', active: true, role: 'calisan' as const, color: '#7c3aed' },
  ];

  const customers = [
    { id: 'cus_xyz', company: 'XYZ Ltd.', contact: 'Murat Aksoy', phone: '0212 555 10 20', email: 'info@xyzltd.com', address: 'Maslak Mah. Büyükdere Cad. No:128, Sarıyer / İstanbul', taxOffice: 'Maslak', taxNo: '8350042917', note: 'Uzun süreli kurumsal müşteri. Ödemeler düzenli.', tags: ['kurumsal', 'uzun vadeli'], status: 'aktif' as const },
    { id: 'cus_abcinsaat', company: 'ABC İnşaat', contact: 'Hasan Yıldırım', phone: '0216 444 30 40', email: 'hasan@abcinsaat.com.tr', address: 'Ataşehir Bulvarı No:42, Ataşehir / İstanbul', taxOffice: 'Ataşehir', taxNo: '6120088453', note: 'Web sitesi ve kurumsal kimlik projeleri yürütülüyor.', tags: ['inşaat'], status: 'aktif' as const },
    { id: 'cus_ornekgida', company: 'Örnek Gıda', contact: 'Zeynep Arslan', phone: '0312 333 20 10', email: 'zeynep@ornekgida.com', address: 'İvedik OSB 1354. Cadde No:8, Yenimahalle / Ankara', taxOffice: 'İvedik', taxNo: '3980077126', note: '', tags: ['gıda'], status: 'aktif' as const },
    { id: 'cus_nova', company: 'Nova Lojistik', contact: 'Emre Koç', phone: '0232 222 90 80', email: 'emre@novalojistik.com', address: 'Çankaya Mah. Liman Cad. No:5, Konak / İzmir', taxOffice: 'Konak', taxNo: '1740033562', note: 'Filo takip yazılımı görüşmeleri sürüyor.', tags: ['lojistik', 'potansiyel'], status: 'aktif' as const },
    { id: 'cus_delta', company: 'Delta Mobilya', contact: 'Selin Erden', phone: '0224 111 70 60', email: 'selin@deltamobilya.com', address: 'Organize San. Böl. 3. Cadde, İnegöl / Bursa', taxOffice: 'İnegöl', taxNo: '5270066319', note: 'E-ticaret sitesi teslim edildi, bakım anlaşması aktif.', tags: ['bakım'], status: 'pasif' as const },
  ];

  const projects = [
    { id: 'prj_web', name: 'Web Sitesi', customerId: 'cus_abcinsaat', startDate: past(26), endDate: future(3), status: 'devam' as const, budget: 180000, note: 'Kurumsal web sitesi yenileme projesi.' },
    { id: 'prj_mobil', name: 'Mobil Uygulama', customerId: 'cus_xyz', startDate: past(40), endDate: future(25), status: 'devam' as const, budget: 420000, note: 'Saha ekibi mobil uygulaması (Android/iOS).' },
    { id: 'prj_kimlik', name: 'Kurumsal Kimlik', customerId: 'cus_ornekgida', startDate: past(15), endDate: future(10), status: 'devam' as const, budget: 95000, note: 'Logo, kartvizit, antetli kağıt ve sosyal medya şablonları.' },
    { id: 'prj_eticaret', name: 'E-Ticaret Bakım', customerId: 'cus_delta', startDate: past(120), endDate: future(240), status: 'devam' as const, budget: 60000, note: 'Yıllık bakım ve güncelleme anlaşması.' },
  ];

  const mkSub = (titles: string[], doneCount: number) =>
    titles.map((t, i) => ({ id: `sub_${Math.random().toString(36).slice(2, 8)}_${i}`, title: t, done: i < doneCount }));

  const mkJob = (j: Partial<Job> & { title: string; customerId: string; assigneeId: string }): Job => ({
    id: `job_${j.title.toLowerCase().replace(/[^a-z0-9]+/gi, '_').slice(0, 20)}_${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    projectId: null,
    startDate: past(5),
    dueDate: future(5),
    time: '',
    priority: 'orta' as Priority,
    status: 'yeni' as JobStatus,
    fee: 0,
    cost: 0,
    tags: [],
    note: '',
    subtasks: [],
    comments: [],
    files: [],
    createdAt: ago(5),
    completedAt: null,
    ...j,
    companyId,
  });

  const jobs: Job[] = [
    mkJob({
      title: 'Web tasarımı', customerId: 'cus_abcinsaat', projectId: 'prj_web', assigneeId: 'emp_ayse',
      description: 'Ana sayfa ve kurumsal sayfaların yeni tasarımının hazırlanması. Müşteri briefi doğrultusunda modern, mobil uyumlu arayüz tasarlanacak.',
      startDate: past(20), dueDate: past(2), priority: 'yuksek', status: 'devam', fee: 45000, cost: 12000, tags: ['tasarım', 'web'],
      subtasks: mkSub(['Tasarım', 'Frontend', 'Backend', 'Test', 'Yayına alma'], 3),
      comments: [
        { id: 'cm1', userId: 'emp_ahmet', text: 'Müşteriden logo dosyasını bekliyoruz.', createdAt: ago(1, 10) },
        { id: 'cm2', userId: 'emp_mehmet', text: 'Logo geldi, tasarıma başladım.', createdAt: ago(1, 14) },
      ],
      files: [
        { id: 'f1', name: 'teklif.pdf', kind: 'pdf' },
        { id: 'f2', name: 'uygulama-ekrani.png', kind: 'png' },
      ],
      note: 'Tasarım onayı müşteri toplantısında alınacak.',
      createdAt: ago(20),
    }),
    mkJob({
      title: 'Logo tasarımı', customerId: 'cus_ornekgida', projectId: 'prj_kimlik', assigneeId: 'emp_ayse',
      description: 'Örnek Gıda için yeni logo tasarımı. 3 alternatif hazırlanacak.',
      startDate: past(12), dueDate: past(5), priority: 'orta', status: 'tamamlandi', fee: 25000, cost: 6000,
      subtasks: mkSub(['Araştırma', 'Eskiz', '3 alternatif', 'Revize', 'Teslim'], 5),
      completedAt: ago(6), createdAt: ago(12),
    }),
    mkJob({
      title: 'Mobil uygulama geliştirme', customerId: 'cus_xyz', projectId: 'prj_mobil', assigneeId: 'emp_ahmet',
      description: 'Saha ekibi için Android/iOS mobil uygulama. Görev atama, konum takibi ve raporlama modülleri içerecek.',
      startDate: past(38), dueDate: future(20), priority: 'yuksek', status: 'devam', fee: 320000, cost: 140000, tags: ['mobil', 'yazılım'],
      subtasks: mkSub(['API tasarımı', 'Giriş ekranları', 'Görev modülü', 'Konum servisi', 'Test'], 2),
      createdAt: ago(38),
    }),
    mkJob({
      title: 'Müşteri toplantısı', customerId: 'cus_nova', assigneeId: 'emp_elif',
      description: 'Filo takip yazılımı için ihtiyaç analizi toplantısı.',
      startDate: past(0), dueDate: past(0), time: '14:00', priority: 'orta', status: 'planlandi', fee: 0, cost: 0, tags: ['toplantı'],
      createdAt: ago(3),
    }),
    mkJob({
      title: 'Sunucu kurulumu', customerId: 'cus_xyz', projectId: 'prj_mobil', assigneeId: 'emp_can',
      description: 'Mobil uygulama backend sunucusunun kurulumu ve yapılandırması.',
      startDate: past(4), dueDate: past(1), priority: 'yuksek', status: 'devam', fee: 35000, cost: 18000, tags: ['altyapı'],
      subtasks: mkSub(['Sunucu temini', 'Kurulum', 'Güvenlik ayarları', 'Yedekleme'], 2),
      createdAt: ago(4),
    }),
    mkJob({
      title: 'ABC Firma toplantısı', customerId: 'cus_abcinsaat', projectId: 'prj_web', assigneeId: 'emp_ahmet',
      description: 'Web sitesi projesi haftalık ilerleme toplantısı.',
      startDate: past(0), dueDate: past(0), time: '10:00', priority: 'yuksek', status: 'planlandi', fee: 0, cost: 0, tags: ['toplantı'],
      createdAt: ago(2),
    }),
    mkJob({
      title: 'Web sitesi teslimi (1. faz)', customerId: 'cus_abcinsaat', projectId: 'prj_web', assigneeId: 'emp_mehmet',
      description: 'Ana sayfa ve hakkımızda sayfalarının müşteriye ilk sunumu.',
      startDate: past(0), dueDate: past(0), time: '11:30', priority: 'yuksek', status: 'devam', fee: 60000, cost: 20000, tags: ['web', 'teslim'],
      createdAt: ago(6),
    }),
    mkJob({
      title: 'Teknik servis', customerId: 'cus_delta', projectId: 'prj_eticaret', assigneeId: 'emp_can',
      description: 'E-ticaret sitesi SSL sertifika yenileme ve performans kontrolü.',
      startDate: past(0), dueDate: past(0), time: '16:30', priority: 'dusuk', status: 'yeni', fee: 8000, cost: 2000, tags: ['bakım'],
      createdAt: ago(1),
    }),
    mkJob({
      title: 'Kartvizit tasarımı', customerId: 'cus_ornekgida', projectId: 'prj_kimlik', assigneeId: 'emp_ayse',
      description: 'Yeni logoya uygun kartvizit tasarımı.',
      startDate: past(6), dueDate: future(2), priority: 'dusuk', status: 'beklemede', fee: 6000, cost: 1500,
      createdAt: ago(6),
    }),
    mkJob({
      title: 'API entegrasyonu', customerId: 'cus_xyz', projectId: 'prj_mobil', assigneeId: 'emp_mehmet',
      description: 'Mobil uygulama için ERP API entegrasyonu.',
      startDate: past(10), dueDate: future(6), priority: 'yuksek', status: 'devam', fee: 55000, cost: 22000, tags: ['yazılım', 'entegrasyon'],
      subtasks: mkSub(['API dokümanı inceleme', 'Kimlik doğrulama', 'Veri eşleme', 'Test'], 1),
      createdAt: ago(10),
    }),
    mkJob({
      title: 'Sosyal medya şablonları', customerId: 'cus_ornekgida', projectId: 'prj_kimlik', assigneeId: 'emp_ayse',
      description: 'Instagram ve LinkedIn paylaşım şablonları.',
      startDate: past(3), dueDate: future(4), priority: 'orta', status: 'yeni', fee: 12000, cost: 3000, tags: ['tasarım', 'sosyal medya'],
      createdAt: ago(3),
    }),
    mkJob({
      title: 'Veritabanı optimizasyonu', customerId: 'cus_delta', projectId: 'prj_eticaret', assigneeId: 'emp_can',
      description: 'E-ticaret sitesi veritabanı sorgu optimizasyonu.',
      startDate: past(15), dueDate: past(8), priority: 'orta', status: 'tamamlandi', fee: 18000, cost: 7000,
      completedAt: ago(9), createdAt: ago(15),
    }),
    mkJob({
      title: 'Teklif hazırlığı — Nova', customerId: 'cus_nova', assigneeId: 'emp_elif',
      description: 'Filo takip yazılımı için fiyat teklifi hazırlanması.',
      startDate: past(2), dueDate: future(1), priority: 'yuksek', status: 'devam', fee: 0, cost: 0, tags: ['satış', 'teklif'],
      createdAt: ago(2),
    }),
    mkJob({
      title: 'Kullanıcı testi', customerId: 'cus_xyz', projectId: 'prj_mobil', assigneeId: 'emp_mehmet',
      description: 'Mobil uygulama beta sürümü kullanıcı testleri.',
      startDate: future(5), dueDate: future(12), priority: 'orta', status: 'planlandi', fee: 20000, cost: 8000,
      createdAt: ago(1),
    }),
    mkJob({
      title: 'İçerik girişi', customerId: 'cus_abcinsaat', projectId: 'prj_web', assigneeId: 'emp_mehmet',
      description: 'Web sitesi kurumsal içeriklerinin yönetim paneline girilmesi.',
      startDate: past(1), dueDate: future(3), priority: 'dusuk', status: 'yeni', fee: 9000, cost: 2500, tags: ['içerik'],
      createdAt: ago(1),
    }),
    mkJob({
      title: 'Güvenlik denetimi', customerId: 'cus_xyz', assigneeId: 'emp_can',
      description: 'Sunucu altyapısı periyodik güvenlik denetimi.',
      startDate: past(30), dueDate: past(25), priority: 'yuksek', status: 'tamamlandi', fee: 22000, cost: 9000,
      completedAt: ago(26), createdAt: ago(30),
    }),
    mkJob({
      title: 'Antetli kağıt tasarımı', customerId: 'cus_ornekgida', projectId: 'prj_kimlik', assigneeId: 'emp_ayse',
      description: 'Kurumsal antetli kağıt ve zarf tasarımı.',
      startDate: past(8), dueDate: past(3), priority: 'dusuk', status: 'kontrolde', fee: 5000, cost: 1200,
      createdAt: ago(8),
    }),
    mkJob({
      title: 'E-posta kampanyası', customerId: 'cus_abcinsaat', assigneeId: 'emp_elif',
      description: 'Yeni ürün duyurusu için e-posta kampanyası hazırlığı.',
      startDate: past(5), dueDate: future(8), priority: 'orta', status: 'planlandi', fee: 15000, cost: 5000, tags: ['pazarlama'],
      createdAt: ago(5),
    }),
    mkJob({
      title: 'Eski site veri taşıma', customerId: 'cus_abcinsaat', projectId: 'prj_web', assigneeId: 'emp_ahmet',
      description: 'Eski web sitesindeki içeriklerin yeni altyapıya taşınması.',
      startDate: past(18), dueDate: past(10), priority: 'orta', status: 'tamamlandi', fee: 14000, cost: 5000,
      completedAt: ago(11), createdAt: ago(18),
    }),
    mkJob({
      title: 'Bakım anlaşması yenileme', customerId: 'cus_delta', assigneeId: 'emp_elif',
      description: 'Yıllık bakım anlaşmasının yenilenmesi görüşmesi.',
      startDate: past(20), dueDate: past(15), priority: 'dusuk', status: 'iptal', fee: 0, cost: 0,
      note: 'Müşteri erteleme talebinde bulundu.',
      createdAt: ago(20),
    }),
  ];

  const meetings = [
    { id: 'mt_1', title: 'ABC Ltd. Toplantısı', date: future(1), time: '14:00', participantIds: ['emp_ahmet', 'emp_mehmet', 'emp_ayse'], customerId: 'cus_abcinsaat', location: 'Müşteri Ofisi — Ataşehir', description: 'Web sitesi projesi tasarım onayı ve ilerleme değerlendirmesi.', note: 'Tasarım sunumu hazırlanacak.' },
    { id: 'mt_2', title: 'Nova Lojistik Demo', date: future(3), time: '10:30', participantIds: ['emp_elif', 'emp_ahmet'], customerId: 'cus_nova', location: 'Online (Zoom)', description: 'Filo takip yazılımı demo sunumu.', note: '' },
    { id: 'mt_3', title: 'Haftalık Ekip Toplantısı', date: past(0), time: '09:30', participantIds: ['emp_ahmet', 'emp_mehmet', 'emp_ayse', 'emp_can', 'emp_elif'], customerId: null, location: 'Toplantı Odası 2', description: 'Haftalık iş planı ve blokajların değerlendirilmesi.', note: '' },
    { id: 'mt_4', title: 'Örnek Gıda Kimlik Sunumu', date: future(6), time: '15:00', participantIds: ['emp_ayse'], customerId: 'cus_ornekgida', location: 'Müşteri Ofisi — Ankara', description: 'Kurumsal kimlik çalışmalarının ilk sunumu.', note: 'Baskı örnekleri götürülecek.' },
  ];

  const transactions = [
    { id: 'tr_1', type: 'gelir' as const, description: 'Web Sitesi Projesi — 1. hakediş', amount: 90000, date: past(18), customerId: 'cus_abcinsaat', projectId: 'prj_web', category: 'Hakediş' },
    { id: 'tr_2', type: 'gelir' as const, description: 'Mobil Uygulama — sözleşme avansı', amount: 120000, date: past(35), customerId: 'cus_xyz', projectId: 'prj_mobil', category: 'Avans' },
    { id: 'tr_3', type: 'gelir' as const, description: 'Logo tasarımı teslim ödemesi', amount: 25000, date: past(6), customerId: 'cus_ornekgida', projectId: 'prj_kimlik', category: 'Teslim' },
    { id: 'tr_4', type: 'gelir' as const, description: 'E-ticaret bakım — Ağustos', amount: 15000, date: past(10), customerId: 'cus_delta', projectId: 'prj_eticaret', category: 'Bakım' },
    { id: 'tr_5', type: 'gider' as const, description: 'Sunucu ve alan adı giderleri', amount: 22000, date: past(12), customerId: null, projectId: 'prj_mobil', category: 'Altyapı' },
    { id: 'tr_6', type: 'gider' as const, description: 'Ofis kirası — Ağustos', amount: 45000, date: past(20), customerId: null, projectId: null, category: 'Kira' },
    { id: 'tr_7', type: 'gider' as const, description: 'Tasarım yazılım lisansları', amount: 9500, date: past(8), customerId: null, projectId: null, category: 'Yazılım' },
    { id: 'tr_8', type: 'gider' as const, description: 'Dış kaynak — içerik yazarlığı', amount: 12000, date: past(4), customerId: 'cus_abcinsaat', projectId: 'prj_web', category: 'Dış kaynak' },
    { id: 'tr_9', type: 'gelir' as const, description: 'Kurumsal kimlik — avans', amount: 40000, date: past(14), customerId: 'cus_ornekgida', projectId: 'prj_kimlik', category: 'Avans' },
    { id: 'tr_10', type: 'gider' as const, description: 'Ulaşım ve saha giderleri', amount: 6500, date: past(2), customerId: null, projectId: null, category: 'Operasyon' },
  ];

  const notifications = [
    { id: 'nt_1', text: 'Size yeni bir iş atandı: "Teknik servis"', kind: 'info' as const, createdAt: ago(1, 9), read: false, jobId: undefined },
    { id: 'nt_2', text: '"Web tasarımı" işinin teslim tarihi geçti.', kind: 'uyari' as const, createdAt: ago(0, 8), read: false },
    { id: 'nt_3', text: '"Web tasarımı" işine yeni bir yorum eklendi.', kind: 'info' as const, createdAt: ago(1, 14), read: true },
    { id: 'nt_4', text: 'Yarın 1 toplantınız var: "ABC Ltd. Toplantısı"', kind: 'info' as const, createdAt: ago(0, 9), read: false },
  ];

  const activities = [
    { id: 'ac_1', userId: 'emp_ahmet', text: '"Web tasarımı" işinin durumunu değiştirdi.', createdAt: ago(0, 10) },
    { id: 'ac_2', userId: 'emp_mehmet', text: '"Web tasarımı" işine yeni dosya yükledi.', createdAt: ago(0, 11) },
    { id: 'ac_3', userId: 'emp_ayse', text: '"Sosyal medya şablonları" işini oluşturdu.', createdAt: ago(0, 11) },
    { id: 'ac_4', userId: 'emp_can', text: '"Sunucu kurulumu" işinde ilerleme kaydetti.', createdAt: ago(1, 15) },
    { id: 'ac_5', userId: 'emp_elif', text: '"Teklif hazırlığı — Nova" işini oluşturdu.', createdAt: ago(2, 16) },
  ];

  const withCompany = <T extends object>(items: T[]): (T & { companyId: string })[] => items.map((item) => ({ ...item, companyId }));

  return {
    company: { id: companyId, name: 'ABC Teknoloji', slug: 'abc-teknoloji', active: true, createdAt: ago(120) },
    userAccounts: employees.map((employee) => ({
      id: `user_${employee.id}`, companyId, employeeId: employee.id, email: employee.email,
      role: employee.role, active: employee.active, lastLoginAt: null, createdAt: employee.startDate,
    })),
    departments,
    employees,
    customers: withCompany(customers),
    projects: withCompany(projects),
    jobs: withCompany(jobs),
    meetings: withCompany(meetings),
    transactions: withCompany(transactions),
    notifications: withCompany(notifications),
    activities: withCompany(activities),
    settings: {
      companyName: 'ABC Teknoloji',
      phone: '0212 900 00 00',
      email: 'info@abcteknoloji.com',
      address: 'Maslak Mah. Teknoloji Cad. No:1, Sarıyer / İstanbul',
      currency: 'TRY',
      theme: 'light',
    },
  };
}