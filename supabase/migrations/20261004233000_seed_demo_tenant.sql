-- İş Takip demo verisini gerçek Supabase tenant'ına taşır.
do $$
declare
  v_company_id uuid;
  v_alper_id uuid;
begin
  select id into v_company_id from public.companies where slug = 'abc-teknoloji' limit 1;
  if v_company_id is null then
    raise exception 'ABC Teknoloji şirketi bulunamadı';
  end if;

  insert into public.departments (id, company_id, name) values
    ('365edc89-28b0-50e1-9cea-433338f00129',v_company_id,'Yönetim'),
    ('21705341-eedd-538e-a1d3-6ab447146f57',v_company_id,'Satış'),
    ('5d410f5a-1196-56e2-a38e-d8b48d3167b4',v_company_id,'Pazarlama'),
    ('c48ea27b-50b1-5d0b-a9b0-22a1c16510bf',v_company_id,'Muhasebe'),
    ('d5126c0b-45f0-573a-9226-a39a1dbcc968',v_company_id,'Teknik'),
    ('90827331-3168-5035-9427-9fd9d4e5fbf8',v_company_id,'Yazılım'),
    ('c81bad9d-976b-53e1-8000-71b5101774d7',v_company_id,'İnsan Kaynakları'),
    ('b54f9d28-9a2c-5c30-89ac-b8c5de39a967',v_company_id,'Operasyon')
  on conflict (id) do nothing;

  select id into v_alper_id from public.employees where company_id=v_company_id and email='alperoyanik@gmail.com' limit 1;
  update public.employees set department_id='90827331-3168-5035-9427-9fd9d4e5fbf8', position='Kıdemli Yazılım Geliştirici', role='yonetici', color='#0d9488', active=true where id=v_alper_id;

  insert into public.employees (id,company_id,name,phone,email,department_id,position,start_date,active,role,color) values
    ('3be0874d-f62d-547b-96cc-6c8493a260d4',v_company_id,'Mehmet Kaya','0533 444 55 66','mehmet@abcteknoloji.com','90827331-3168-5035-9427-9fd9d4e5fbf8','Frontend Geliştirici','2023-01-09',true,'yardimci','#2563eb'),
    ('e5d15ef8-9c38-5588-861e-961171b44838',v_company_id,'Ayşe Demir','0534 777 88 99','ayse@abcteknoloji.com','5d410f5a-1196-56e2-a38e-d8b48d3167b4','Grafik Tasarımcı','2021-06-21',true,'calisan','#db2777'),
    ('2a841359-a1c9-56e7-b64d-ea15cc9cc969',v_company_id,'Can Öz','0535 123 45 67','can@abcteknoloji.com','d5126c0b-45f0-573a-9226-a39a1dbcc968','Sistem Uzmanı','2023-09-04',true,'calisan','#d97706'),
    ('2f1f8d75-f277-5e2c-aedd-f98c1448250a',v_company_id,'Elif Şahin','0536 987 65 43','elif@abcteknoloji.com','21705341-eedd-538e-a1d3-6ab447146f57','Satış Temsilcisi','2024-02-12',true,'calisan','#7c3aed')
  on conflict (id) do nothing;

  insert into public.customers (id,company_id,company_name,contact,phone,email,address,tax_office,tax_no,note,tags,status) values
    ('05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb',v_company_id,'XYZ Ltd.','Murat Aksoy','0212 555 10 20','info@xyzltd.com','Maslak Mah. Büyükdere Cad. No:128, Sarıyer / İstanbul','Maslak','8350042917','Uzun süreli kurumsal müşteri. Ödemeler düzenli.','{"kurumsal","uzun vadeli"}','aktif'),
    ('2088b681-011f-5cfd-9114-229c3f4db147',v_company_id,'ABC İnşaat','Hasan Yıldırım','0216 444 30 40','hasan@abcinsaat.com.tr','Ataşehir Bulvarı No:42, Ataşehir / İstanbul','Ataşehir','6120088453','Web sitesi ve kurumsal kimlik projeleri yürütülüyor.','{"inşaat"}','aktif'),
    ('10325f9b-7b75-5311-b6f1-d11b9cc4a776',v_company_id,'Örnek Gıda','Zeynep Arslan','0312 333 20 10','zeynep@ornekgida.com','İvedik OSB 1354. Cadde No:8, Yenimahalle / Ankara','İvedik','3980077126','','{"gıda"}','aktif'),
    ('78899f27-8a5d-57ba-96e0-cb5d731487d9',v_company_id,'Nova Lojistik','Emre Koç','0232 222 90 80','emre@novalojistik.com','Çankaya Mah. Liman Cad. No:5, Konak / İzmir','Konak','1740033562','Filo takip yazılımı görüşmeleri sürüyor.','{"lojistik","potansiyel"}','aktif'),
    ('9cb9158c-495f-59d2-b0d7-07d75a83fdd1',v_company_id,'Delta Mobilya','Selin Erden','0224 111 70 60','selin@deltamobilya.com','Organize San. Böl. 3. Cadde, İnegöl / Bursa','İnegöl','5270066319','E-ticaret sitesi teslim edildi, bakım anlaşması aktif.','{"bakım"}','pasif')
  on conflict (id) do nothing;

  insert into public.projects (id,company_id,name,customer_id,start_date,end_date,status,budget,note) values
    ('8fee47d2-ae32-52c0-80df-91cf48fff34e',v_company_id,'Web Sitesi','2088b681-011f-5cfd-9114-229c3f4db147',current_date-26,current_date+3,'devam',180000,'Kurumsal web sitesi yenileme projesi.'),
    ('81d1526c-448e-54d4-a09d-2acbfdd812b8',v_company_id,'Mobil Uygulama','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb',current_date-40,current_date+25,'devam',420000,'Saha ekibi mobil uygulaması (Android/iOS).'),
    ('8b1ca55f-7356-510b-8d63-a37f4ea52ab5',v_company_id,'Kurumsal Kimlik','10325f9b-7b75-5311-b6f1-d11b9cc4a776',current_date-15,current_date+10,'devam',95000,'Logo, kartvizit ve sosyal medya şablonları.'),
    ('89f8bff0-029d-539f-b5f9-3c76f034de54',v_company_id,'E-Ticaret Bakım','9cb9158c-495f-59d2-b0d7-07d75a83fdd1',current_date-120,current_date+240,'devam',60000,'Yıllık bakım ve güncelleme anlaşması.')
  on conflict (id) do nothing;

  insert into public.jobs (id,company_id,title,description,customer_id,project_id,assignee_id,start_date,due_date,time,priority,status,fee,cost,tags,note,subtasks,comments,files,created_at,completed_at) values
  ('11111111-1111-4111-8111-111111111111',v_company_id,'Web tasarımı','Ana sayfa ve kurumsal sayfaların yeni tasarımı.','2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e','e5d15ef8-9c38-5588-861e-961171b44838',current_date-20,current_date-2,'','yuksek','devam',45000,12000,'{"tasarım","web"}','Tasarım onayı müşteri toplantısında alınacak.','[{"id":"sub1","title":"Tasarım","done":true},{"id":"sub2","title":"Frontend","done":true},{"id":"sub3","title":"Backend","done":true},{"id":"sub4","title":"Test","done":false}]',jsonb_build_array(jsonb_build_object('id','cm1','userId',v_alper_id,'text','Müşteriden logo dosyasını bekliyoruz.','createdAt',now())),'[{"id":"f1","name":"teklif.pdf","kind":"pdf"},{"id":"f2","name":"uygulama-ekrani.png","kind":"png"}]',now()-interval '20 days',null),
  ('22222222-2222-4222-8222-222222222222',v_company_id,'Logo tasarımı','Örnek Gıda için yeni logo tasarımı.','10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','e5d15ef8-9c38-5588-861e-961171b44838',current_date-12,current_date-5,'','orta','tamamlandi',25000,6000,'{"tasarım"}','', '[]','[]','[]',now()-interval '12 days',now()-interval '6 days'),
  ('33333333-3333-4333-8333-333333333333',v_company_id,'Mobil uygulama geliştirme','Saha ekibi için Android/iOS mobil uygulama.','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb','81d1526c-448e-54d4-a09d-2acbfdd812b8',v_alper_id,current_date-38,current_date+20,'','yuksek','devam',320000,140000,'{"mobil","yazılım"}','', '[{"id":"s1","title":"API tasarımı","done":true},{"id":"s2","title":"Giriş ekranları","done":true},{"id":"s3","title":"Görev modülü","done":false}]','[]','[]',now()-interval '38 days',null),
  ('44444444-4444-4444-8444-444444444444',v_company_id,'Müşteri toplantısı','Filo takip yazılımı için ihtiyaç analizi.','78899f27-8a5d-57ba-96e0-cb5d731487d9',null,'2f1f8d75-f277-5e2c-aedd-f98c1448250a',current_date,current_date,'14:00','orta','planlandi',0,0,'{"toplantı"}','','[]','[]','[]',now()-interval '3 days',null),
  ('55555555-5555-4555-8555-555555555555',v_company_id,'Sunucu kurulumu','Backend sunucusunun kurulumu ve yapılandırması.','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb','81d1526c-448e-54d4-a09d-2acbfdd812b8','2a841359-a1c9-56e7-b64d-ea15cc9cc969',current_date-4,current_date-1,'','yuksek','devam',35000,18000,'{"altyapı"}','','[]','[]','[]',now()-interval '4 days',null),
  ('66666666-6666-4666-8666-666666666666',v_company_id,'ABC Firma toplantısı','Web sitesi projesi haftalık ilerleme toplantısı.','2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e',v_alper_id,current_date,current_date,'10:00','yuksek','planlandi',0,0,'{"toplantı"}','','[]','[]','[]',now()-interval '2 days',null),
  ('77777777-7777-4777-8777-777777777777',v_company_id,'Web sitesi teslimi (1. faz)','Ana sayfa ve hakkımızda sayfalarının ilk sunumu.','2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e','3be0874d-f62d-547b-96cc-6c8493a260d4',current_date,current_date,'11:30','yuksek','devam',60000,20000,'{"web","teslim"}','','[]','[]','[]',now()-interval '6 days',null),
  ('88888888-8888-4888-8888-888888888888',v_company_id,'Teknik servis','SSL yenileme ve performans kontrolü.','9cb9158c-495f-59d2-b0d7-07d75a83fdd1','89f8bff0-029d-539f-b5f9-3c76f034de54','2a841359-a1c9-56e7-b64d-ea15cc9cc969',current_date,current_date,'16:30','dusuk','yeni',8000,2000,'{"bakım"}','','[]','[]','[]',now()-interval '1 day',null),
  ('99999999-9999-4999-8999-999999999999',v_company_id,'Kartvizit tasarımı','Yeni logoya uygun kartvizit tasarımı.','10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','e5d15ef8-9c38-5588-861e-961171b44838',current_date-6,current_date+2,'','dusuk','beklemede',6000,1500,'{"tasarım"}','','[]','[]','[]',now()-interval '6 days',null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',v_company_id,'API entegrasyonu','ERP API entegrasyonu.','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb','81d1526c-448e-54d4-a09d-2acbfdd812b8','3be0874d-f62d-547b-96cc-6c8493a260d4',current_date-10,current_date+6,'','yuksek','devam',55000,22000,'{"yazılım","entegrasyon"}','','[]','[]','[]',now()-interval '10 days',null),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',v_company_id,'Sosyal medya şablonları','Instagram ve LinkedIn şablonları.','10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','e5d15ef8-9c38-5588-861e-961171b44838',current_date-3,current_date+4,'','orta','yeni',12000,3000,'{"tasarım","sosyal medya"}','','[]','[]','[]',now()-interval '3 days',null),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',v_company_id,'Veritabanı optimizasyonu','E-ticaret sitesi sorgu optimizasyonu.','9cb9158c-495f-59d2-b0d7-07d75a83fdd1','89f8bff0-029d-539f-b5f9-3c76f034de54','2a841359-a1c9-56e7-b64d-ea15cc9cc969',current_date-15,current_date-8,'','orta','tamamlandi',18000,7000,'{"yazılım"}','','[]','[]','[]',now()-interval '15 days',now()-interval '9 days'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd',v_company_id,'Teklif hazırlığı — Nova','Filo takip yazılımı fiyat teklifi.','78899f27-8a5d-57ba-96e0-cb5d731487d9',null,'2f1f8d75-f277-5e2c-aedd-f98c1448250a',current_date-2,current_date+1,'','yuksek','devam',0,0,'{"satış","teklif"}','','[]','[]','[]',now()-interval '2 days',null),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',v_company_id,'Kullanıcı testi','Mobil uygulama beta kullanıcı testleri.','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb','81d1526c-448e-54d4-a09d-2acbfdd812b8','3be0874d-f62d-547b-96cc-6c8493a260d4',current_date+5,current_date+12,'','orta','planlandi',20000,8000,'{"test"}','','[]','[]','[]',now()-interval '1 day',null),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff',v_company_id,'İçerik girişi','Kurumsal içeriklerin yönetim paneline girilmesi.','2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e','3be0874d-f62d-547b-96cc-6c8493a260d4',current_date-1,current_date+3,'','dusuk','yeni',9000,2500,'{"içerik"}','','[]','[]','[]',now()-interval '1 day',null),
  ('10101010-1010-4010-8010-101010101010',v_company_id,'Güvenlik denetimi','Sunucu altyapısı periyodik güvenlik denetimi.','05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb',null,'2a841359-a1c9-56e7-b64d-ea15cc9cc969',current_date-30,current_date-25,'','yuksek','tamamlandi',22000,9000,'{"güvenlik"}','','[]','[]','[]',now()-interval '30 days',now()-interval '26 days'),
  ('20202020-2020-4020-8020-202020202020',v_company_id,'Antetli kağıt tasarımı','Kurumsal antetli kağıt ve zarf tasarımı.','10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','e5d15ef8-9c38-5588-861e-961171b44838',current_date-8,current_date-3,'','dusuk','kontrolde',5000,1200,'{"tasarım"}','','[]','[]','[]',now()-interval '8 days',null),
  ('30303030-3030-4030-8030-303030303030',v_company_id,'E-posta kampanyası','Yeni ürün duyurusu için e-posta kampanyası.','2088b681-011f-5cfd-9114-229c3f4db147',null,'2f1f8d75-f277-5e2c-aedd-f98c1448250a',current_date-5,current_date+8,'','orta','planlandi',15000,5000,'{"pazarlama"}','','[]','[]','[]',now()-interval '5 days',null),
  ('40404040-4040-4040-8040-404040404040',v_company_id,'Eski site veri taşıma','Eski web sitesi içeriklerinin yeni altyapıya taşınması.','2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e',v_alper_id,current_date-18,current_date-10,'','orta','tamamlandi',14000,5000,'{"web"}','','[]','[]','[]',now()-interval '18 days',now()-interval '11 days'),
  ('50505050-5050-4050-8050-505050505050',v_company_id,'Bakım anlaşması yenileme','Yıllık bakım anlaşmasının yenilenmesi görüşmesi.','9cb9158c-495f-59d2-b0d7-07d75a83fdd1',null,'2f1f8d75-f277-5e2c-aedd-f98c1448250a',current_date-20,current_date-15,'','dusuk','iptal',0,0,'{"satış"}','Müşteri erteleme talebinde bulundu.','[]','[]','[]',now()-interval '20 days',null)
  on conflict (id) do nothing;

  insert into public.meetings (id,company_id,title,date,time,participant_ids,customer_id,location,description,note) values
    ('60606060-6060-4060-8060-606060606060',v_company_id,'ABC Ltd. Toplantısı',current_date+1,'14:00',ARRAY[v_alper_id,'3be0874d-f62d-547b-96cc-6c8493a260d4','e5d15ef8-9c38-5588-861e-961171b44838']::uuid[],'2088b681-011f-5cfd-9114-229c3f4db147','Müşteri Ofisi — Ataşehir','Web sitesi projesi tasarım onayı ve ilerleme değerlendirmesi.','Tasarım sunumu hazırlanacak.'),
    ('70707070-7070-4070-8070-707070707070',v_company_id,'Nova Lojistik Demo',current_date+3,'10:30',ARRAY['2f1f8d75-f277-5e2c-aedd-f98c1448250a',v_alper_id]::uuid[],'78899f27-8a5d-57ba-96e0-cb5d731487d9','Online (Zoom)','Filo takip yazılımı demo sunumu.',''),
    ('80808080-8080-4080-8080-808080808080',v_company_id,'Haftalık Ekip Toplantısı',current_date,'09:30',ARRAY[v_alper_id,'3be0874d-f62d-547b-96cc-6c8493a260d4','e5d15ef8-9c38-5588-861e-961171b44838','2a841359-a1c9-56e7-b64d-ea15cc9cc969','2f1f8d75-f277-5e2c-aedd-f98c1448250a']::uuid[],null,'Toplantı Odası 2','Haftalık iş planı ve blokajların değerlendirilmesi.',''),
    ('90909090-9090-4090-8090-909090909090',v_company_id,'Örnek Gıda Kimlik Sunumu',current_date+6,'15:00',ARRAY['e5d15ef8-9c38-5588-861e-961171b44838']::uuid[],'10325f9b-7b75-5311-b6f1-d11b9cc4a776','Müşteri Ofisi — Ankara','Kurumsal kimlik çalışmalarının ilk sunumu.','Baskı örnekleri götürülecek.')
  on conflict (id) do nothing;

  insert into public.transactions (id,company_id,type,description,amount,date,customer_id,project_id,category) values
    ('12121212-1212-4212-8212-121212121212',v_company_id,'gelir','Web Sitesi Projesi — 1. hakediş',90000,current_date-18,'2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e','Hakediş'),
    ('13131313-1313-4313-8313-131313131313',v_company_id,'gelir','Mobil Uygulama — sözleşme avansı',120000,current_date-35,'05f10a36-dcd2-5bf3-ba2c-5eb5688a3bcb','81d1526c-448e-54d4-a09d-2acbfdd812b8','Avans'),
    ('14141414-1414-4414-8414-141414141414',v_company_id,'gelir','Logo tasarımı teslim ödemesi',25000,current_date-6,'10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','Teslim'),
    ('15151515-1515-4515-8515-151515151515',v_company_id,'gelir','E-ticaret bakım — Ağustos',15000,current_date-10,'9cb9158c-495f-59d2-b0d7-07d75a83fdd1','89f8bff0-029d-539f-b5f9-3c76f034de54','Bakım'),
    ('16161616-1616-4616-8616-161616161616',v_company_id,'gider','Sunucu ve alan adı giderleri',22000,current_date-12,null,'81d1526c-448e-54d4-a09d-2acbfdd812b8','Altyapı'),
    ('17171717-1717-4717-8717-171717171717',v_company_id,'gider','Ofis kirası — Ağustos',45000,current_date-20,null,null,'Kira'),
    ('18181818-1818-4818-8818-181818181818',v_company_id,'gider','Tasarım yazılım lisansları',9500,current_date-8,null,null,'Yazılım'),
    ('19191919-1919-4919-8919-191919191919',v_company_id,'gider','Dış kaynak — içerik yazarlığı',12000,current_date-4,'2088b681-011f-5cfd-9114-229c3f4db147','8fee47d2-ae32-52c0-80df-91cf48fff34e','Dış kaynak'),
    ('20212121-2121-4121-8121-202121212121',v_company_id,'gelir','Kurumsal kimlik — avans',40000,current_date-14,'10325f9b-7b75-5311-b6f1-d11b9cc4a776','8b1ca55f-7356-510b-8d63-a37f4ea52ab5','Avans'),
    ('21212121-2121-4121-8121-212121212121',v_company_id,'gider','Ulaşım ve saha giderleri',6500,current_date-2,null,null,'Operasyon')
  on conflict (id) do nothing;

  insert into public.notifications (id,company_id,text,kind,created_at,read,job_id) values
    ('22212221-2221-4221-8221-222122212221',v_company_id,'Size yeni bir iş atandı: "Teknik servis"','info',now()-interval '1 day',false,'88888888-8888-4888-8888-888888888888'),
    ('23232323-2323-4232-8232-232323232323',v_company_id,'"Web tasarımı" işinin teslim tarihi geçti.','uyari',now(),false,'11111111-1111-4111-8111-111111111111'),
    ('24242424-2424-4242-8242-242424242424',v_company_id,'"Web tasarımı" işine yeni bir yorum eklendi.','info',now()-interval '1 day',true,'11111111-1111-4111-8111-111111111111')
  on conflict (id) do nothing;

  insert into public.company_settings(company_id,company_name,phone,email,address,currency,theme)
  values(v_company_id,'ABC Teknoloji','0212 900 00 00','info@abcteknoloji.com','Maslak Mah. Teknoloji Cad. No:1, Sarıyer / İstanbul','TRY','light')
  on conflict(company_id) do update set company_name=excluded.company_name,phone=excluded.phone,email=excluded.email,address=excluded.address;

  update public.user_accounts set employee_id=v_alper_id, company_id=v_company_id, role='yonetici', active=true
  where email='alperoyanik@gmail.com';

end $$;
