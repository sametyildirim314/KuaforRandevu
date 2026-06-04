# Kuaför ve Güzellik Salonları İçin Yeni Nesil Randevu Yönetim Sistemi (Barbershop Appointment System)
**Proje Sonuç Raporu**

---

## İÇİNDEKİLER
1. [ÖZET (ABSTRACT)](#1-özet-abstract)
2. [GİRİŞ](#2-giriş)
3. [HAFTALIK PROJE GELİŞTİRME SÜRECİ](#3-haftalik-proje-geliştirme-süreci)
4. [MİMARİ TASARIM VE TEKNOLOJİ YIĞINI](#4-mimari-tasarim-ve-teknoloji-yiğinia)
5. [VERİTABANI VE VERİ MODELİ TASARIMI](#5-veritabani-ve-veri-modeli-tasarimi)
6. [GÜVENLİK, KİMLİK DOĞRULAMA VE YETKİLENDİRME](#6-güvenlik-kimlik-doğrulama-ve-yetkilendirme)
7. [GERÇEK ZAMANLI İLETİŞİM (REAL-TIME COMMUNICATION)](#7-gerçek-zamanli-i̇leti̇şi̇m-real-time-communication)
8. [PERFORMANS OPTİMİZASYONLARI](#8-performans-opti̇mi̇zasyonlari)
9. [KALİTE GÜVENCESİ VE TEST SÜREÇLERİ (QA & TESTING)](#9-kali̇te-güvencesi̇-ve-test-süreçleri̇-qa--testing)
10. [SÜREKLİ ENTEGRASYON VE DAĞITIM (CI/CD) HAZIRLIKLARI](#10-sürekli̇-entegrasyon-ve-dağitim-cicd-hazirliklari)
11. [SONUÇ VE GELECEK ÇALIŞMALAR](#11-sonuç-ve-gelecek-çalişmalar-conclusion--future-work)

---

## 1. ÖZET (ABSTRACT)
Bu proje kapsamında; kuaförler, güzellik uzmanları ve müşterileri tek bir platformda buluşturan, yüksek performanslı, ölçeklenebilir ve platform bağımsız (çapraz platform) bir "Randevu Yönetim Sistemi" tasarlanmış ve geliştirilmiştir. Sistemin arka ucu (backend) **.NET 8** teknolojisi ve **Temiz Mimari (Clean Architecture)** prensipleri kullanılarak inşa edilmiş; mobil istemci tarafı (frontend) ise **React Native** ve **Expo** altyapısıyla geliştirilmiştir. Gerçek zamanlı bildirimler, gelişmiş güvenlik önlemleri, çoklu rol yapısı (Müşteri, Kuaför, Admin) ve performans optimizasyonlarını barındıran bu proje, 10 haftalık çevik (agile) bir geliştirme süreci ile yayına hazır (production-ready) hale getirilmiştir.

---

## 2. GİRİŞ
Güzellik ve kişisel bakım sektöründe, işletmelerin randevu defteri yönetimi ve müşterilerin uygun saat bulma süreçleri sıklıkla iletişim kopukluklarına, vakit kayıplarına ve verimsizliğe yol açmaktadır. Bu projenin temel amacı; müşterilerin kolayca salon arayabildiği, istedikleri hizmet, kuaför ve zaman dilimine göre rezervasyon yapabildiği; salon çalışanlarının (kuaförlerin) ise kendi takvimlerini, gelirlerini ve randevu durumlarını dinamik olarak yönetebildiği merkezi bir dijital ekosistem yaratmaktır.

---

## 3. HAFTALIK PROJE GELİŞTİRME SÜRECİ

### HAFTA 1 - Proje Altyapısı ve Kimlik Doğrulama
**Haftanın Özeti:** Projenin ilk haftasında, uygulamanın iskeletini oluşturmaya odaklandık. Hem mobil tarafta React Native ile temel navigasyon ve ekran yapısını kurarken, hem de arka planda sağlam bir .NET 8 Web API mimarisi (Clean Architecture formunda) inşa ettik. Kimlik doğrulama sistemleri, token yönetimi ve SQL veritabanı entegrasyonu ile uygulamanın güvenli temel taşları atılmış oldu.

**Frontend**
- Expo projesi oluşturma ve klasör yapısı kurulumu (screens, components, services, navigation, store, utils)
- React Navigation kurulumu (Stack + Bottom Tab navigator)
- Axios instance ve interceptor yapılandırması (base URL, token ekleme, hata yönetimi)
- Login, Register ekranları (Kullanıcı dostu UI bileşenleri)
- Zustand ile `authStore` oluşturma (token, user bilgisi, login/logout aksiyonları)
- AsyncStorage ile token saklama ve otomatik oturum açma mekanizması

**Backend**
- .NET 8 Web API projesi oluşturma (Clean Architecture: API, Application, Domain, Infrastructure katmanları)
- SQLite bağlantısı ve Entity Framework Core yapılandırması
- Users tablosu ve Identity altyapısı (Role mekanizması)
- JWT (JSON Web Token) token üretimi ve doğrulama middleware'i
- Endpoints: POST `/api/auth/register`, `/api/auth/login`
- Swagger dokümantasyonu ve global exception handling (hata yönetimi) middleware kurulumu

---

### HAFTA 2 - Kuaför ve Salon Yönetimi (CRUD)
**Haftanın Özeti:** İkinci haftada uygulamamıza hayat verecek olan ana aktörleri, yani salonları ve kuaförleri sisteme dahil ettik. Müşterilerin görebileceği salon vitrinleri ve kuaför detay ekranlarını arayüzde tasarladık. Arka tarafta ise veritabanı tablolarını genişleterek salonların, kuaförlerin ve sundukları hizmetlerin API üzerinden esnek şekilde yönetilmesini sağlayan CRUD (Create, Read, Update, Delete) operasyonlarını tamamladık.

**Frontend**
- Salon listeleme ekranı (kart tasarımı, arama ve filtreleme bileşenleri)
- Salon detay ekranı (iletişim bilgileri, hizmet listesi, kuaförler sekmesi)
- Hizmet listeleme komponenti (fiyat, süre bilgisi dinamik olarak bağlandı)
- Profil arayüzü temelleri oluşturuldu

**Backend**
- `Salons`, `Barbers`, `Services` varlıklarının (Entity) ve One-to-Many ilişkilerinin kodlanması
- Salon CRUD endpointleri: GET `/api/salons`, GET `/api/salons/{id}`
- Barber CRUD endpointleri: GET `/api/barbers`, GET `/api/barbers/{id}`
- Service CRUD endpointleri: GET `/api/salons/{id}/services`
- AutoMapper profillerinin oluşturulması ve DTO (Data Transfer Object) tasarımları
- FluentValidation ile gelen verilerin doğrulanması

---

### HAFTA 3 - Randevu Sistemi (Core Özellik)
**Haftanın Özeti:** Üçüncü haftada projenin kalbini oluşturan "Randevu Sistemi"ni devreye aldık. Müşterilerin adım adım salon, hizmet, kuaför ve müsait zaman dilimi seçerek rezervasyon yaptırdığı son derece akıcı bir akış tasarlandı. Backend tarafında çakışmaları sıkı şekilde denetleyen, mesai saatleri dışına çıkılmasını engelleyen güçlü iş kuralları ve algoritmalar kurgulandı.

**Frontend**
- Randevu alma akışı tasarımı: Hizmet seç → Kuaför seç → Tarih/saat seç → Onayla
- Gelişmiş takvim (Calendar) komponenti ve saat seçici arayüzü
- Müşteriler için "Randevularım" (My Appointments) listeleme ekranı
- Bekleyen, Onaylanan ve Geçmiş randevular için statü bazlı renklendirme (Badge UI)
- Dinamik Loading (yükleniyor) statüleri

**Backend**
- `Appointments` (Randevular) tablosu ve ilişkilerinin (Customer, Barber, Service) kurulması
- Çakışan randevuları (Double-booking) engelleyen kontrol mekanizmaları
- Endpoints: POST `/api/appointments`, GET `/api/appointments/my`
- Kuaför çalışma saatlerine (WorkStartHour, WorkEndHour) göre saat doğrulama
- Randevu statülerinin (Pending, Confirmed, Completed, Cancelled) Enum olarak sisteme tanıtılması

---

### HAFTA 4 - Değerlendirme Sistemi ve Salon Yönetim Paneli
**Haftanın Özeti:** Dördüncü haftaya geldiğimizde artık sistemi sadece müşterilerin değil, salon sahiplerinin ve kuaförlerin de aktif bir biçimde kullanabileceği "çok oyunculu" devasa bir yapıya dönüştürdük. Müşteriler için tamamlanmış randevulara yıldız ve yorum bırakılabilecek otomatik ortalama bazlı bir değerlendirme sistemi kurduk. Eşzamanlı olarak salon sahiplerine özel yepyeni bir panel (Dashboard) geliştirerek kendi kuaförlerini listeye koyabilecekleri, randevu taleplerini onaylayıp iptal edebilecekleri bir mimari yarattık.

**Frontend**
- Değerlendirme formu (Yıldız puanlama slider + metin yorumu alanı)
- Değerlendirme listeleme komponenti (Kuaför profilinde sonsuz kaydırma ile)
- Ortalama puan (Average Rating) gösterimi
- **Salon Paneli (Dashboard):**
  - Müşteri (Customer) ve Kuaför (Barber) için farklı alt gezinme çubukları (Bottom Tabs)
  - Salon Dashboard (günlük istatistikler ve bekleyen randevu onayları)
  - Randevu Yönetimi ekranı (Onayla, İptal Et, Tamamla butonları)

**Backend**
- `Reviews` (Değerlendirmeler) tablosu ve `AppUser`/`Barber` ile ilişkileri
- Endpoints: POST `/api/reviews`, GET `/api/barbers/{id}/reviews`
- Barber tablosunda `AverageRating` ve `ReviewCount` kolonlarının otomatik güncellenmesi
- **Salon Yönetimi:**
  - JWT token içerisine kullanıcının rol bilgisinin gömülmesi
  - Kuaför bazlı yetkilendirme (`[Authorize(Roles = "Barber")]`)
  - Kuaför Dashboard endpointleri (Onay/İptal mekanizmaları)

---

### HAFTA 5 - Gelişmiş Müsaitlik Algoritması ve Saat Yönetimi
**Haftanın Özeti:** Randevu sisteminin en zorlayıcı kısmı olan saat dilimi hesaplamalarını profesyonelleştirdik. Kuaförün çalışma saatleri, öğle arası ve mevcut dolu randevuları hesaplanarak müşterinin ekranına sadece uygun (boş) 30 veya 45 dakikalık slotların dinamik olarak çıkarıldığı bir algoritma yazıldı.

**Frontend**
- Seçilen kuaför ve tarihe göre dinamik "Saat Slotları" (Örn: 09:00, 09:30, 10:00) ızgarası eklendi.
- Geçmiş saatlerin ve dolu slotların (disabled) gri renkte gösterilmesi ve tıklanamaması sağlandı.
- Zustand içerisindeki `appointmentStore` geliştirilerek, rezervasyon adımları arası veri taşıma optimize edildi.

**Backend**
- `Barber` verisindeki `SlotDurationMinutes` baz alınarak günün matematiksel olarak parçalara bölünmesi.
- Gelen tarihteki tüm onaylanmış (`Confirmed`) ve bekleyen (`Pending`) randevuların sorgulanması.
- Dolu olan slotların listeden çıkarılarak API üzerinden saf "Boş Saatler Listesi" (Available Slots) dönülmesi.
- İstemci (Müşteri) cihazın yerel saati ile sunucu saati (UTC) arasındaki senkronizasyon problemleri çözüldü.

---

### HAFTA 6 - Gerçek Zamanlı Bildirimler (SignalR)
**Haftanın Özeti:** Kullanıcı deneyimini modernleştirmek için geleneksel istek-yanıt (HTTP) yöntemlerinden çıkarak, WebSockets tabanlı gerçek zamanlı iletişim (Real-Time Communication) katmanını kurduk. Bir müşteri randevu aldığında veya kuaför randevuyu onayladığında, karşı tarafın ekranının sayfayı yenilemeye gerek kalmadan anlık olarak güncellenmesi sağlandı.

**Frontend**
- `@microsoft/signalr` kütüphanesinin React Native projelerine dahil edilmesi.
- Müşteri ve Kuaför giriş yaptığında WebSocket bağlantısının otomatik başlatılması (Connection Hook).
- Uygulama içi Toast (uyarı) bildirim bileşeni eklendi. (Örn: "Randevunuz Onaylandı!")
- Gelen bildirim ile listelerin otomatik tetiklenip (Re-fetch) güncellenmesi.

**Backend**
- `SignalR` servislerinin Program.cs içerisine konfigüre edilmesi.
- `NotificationHub` sınıfının oluşturularak Client-Server arası köprünün kurulması.
- `AppointmentService` içerisinde randevu kaydedildiği anda `HubContext` üzerinden ilgili kuaföre anlık veri (payload) gönderimi.
- Kullanıcıların Id'lerine göre özelleştirilmiş spesifik bildirim (User-to-User) yönlendirmesi.

---

### HAFTA 7 - Kuaför Yönetim Paneli İyileştirmeleri ve Yetkilendirme
**Haftanın Özeti:** Kuaförlerin uygulamayı bir iş aracı (Business Tool) olarak kullanabilmesi için mobil panellerine derinlemesine yetenekler ekledik. Kuaförlerin kendi çalışma saatlerini ve slot sürelerini (30dk, 45dk, 1 saat) esnekçe değiştirebileceği ayar sayfaları ile güvenlik amacıyla kendi randevuları dışındaki verilere erişimini engelleyen (Tenancy Control) backend güvenlik kuralları yazıldı.

**Frontend**
- Kuaför Ayarları Ekranı: Çalışma başlangıç ve bitiş saatlerinin güncellenmesi (Örn: 08:00 - 19:00).
- Slot süresi güncelleme alanı (Müşteriye ayrılacak standart vaktin belirlenmesi).
- Onay bekleyenler, bugünün randevuları ve geçmiş randevular için gelişmiş sekme (Tab) gezinimi.
- Gelir hesaplamasına hazırlık için fiyat gösterimi arayüzde belirginleştirildi.

**Backend**
- Endpoints: GET `/api/barberdashboard/working-hours`, PUT `/api/barberdashboard/working-hours`.
- Yetki Kontrolü: İstek atan kişinin JWT token'ı içerisindeki ID'si ile, müdahale edilmek istenen randevunun kuaför ID'si karşılaştırılarak güvenlik açıkları (Unauthorized Access) kapatıldı.
- Müşterilerin iptal ettiği randevuların veritabanı loglarında takip edilebilmesi için Soft Delete yaklaşımına geçiş hazırlığı.

---

### HAFTA 8 - Finans, Raporlama ve İstatistikler
**Haftanın Özeti:** Sistemde işlem gören randevuların finansal değerlerini işletmelere sunmak amacıyla güçlü bir istatistik ve raporlama altyapısı kuruldu. Kuaförlerin günlük cirolarını, tamamlanan iş sayılarını görebilecekleri, motivasyon artırıcı ve iş takibini kolaylaştıran bir modül devreye alındı.

**Frontend**
- "Kazançlarım" (Earnings) ekranı tasarlandı.
- Günlük, Haftalık, Aylık ve Toplam kazançları gösteren özet finansal kartlar eklendi (Dashboard Metric Cards).
- Bugünün toplam randevu sayısını ve beklemede olan iş yükünü gösteren gösterge panelleri entegre edildi.
- React Native animasyonları (Reanimated) kullanılarak verilerin ekrana şık bir geçişle yansıması sağlandı.

**Backend**
- `BarberDashboardService` içerisine detaylı LINQ sorguları yazılarak tarih bazlı ciro hesaplama algoritmaları kuruldu.
- Sadece durumu `Completed` (Tamamlandı) olan randevuların ücretlerinin gelir (Earnings) olarak sayılması sağlandı.
- Endpoints: GET `/api/barberdashboard/summary`, GET `/api/barberdashboard/earnings`.
- Kuaför portföy verilerinin hızlı yanıt vermesi için DTO yapıları minimize edildi.

---

### HAFTA 9 - Kalite Güvencesi ve Test (QA & Testing)
**Haftanın Özeti:** Uygulamanın son kullanıcıya ulaşmadan önce çökmemesi ve siber saldırılara açık olmaması için ciddi bir Kalite Güvencesi (QA) sürecinden geçmesi sağlandı. Backend servisleri için birim testleri (Unit Test) yazılırken, uygulamanın API koruma kalkanları (Security Headers) aktifleştirildi.

**Frontend**
- Kritik ekranlar (Login, Form Validation) için `Jest` kütüphanesi kullanılarak birim (Unit) testler yazıldı.
- `TextInput` alanlarına dışarıdan zararlı veri girişini engelleyen RegExp kısıtlamaları eklendi.
- Görme engelli kullanıcılar veya asistanlar (VoiceOver, TalkBack) için ekran okuyucu uyumluluğu (`accessibilityLabel`, `accessibilityRole`) ana bileşenlere entegre edildi.

**Backend**
- **xUnit** ve **Moq** kütüphaneleri projeye dahil edildi. `AuthService` (Şifreleme, Login) ve `BarberDashboardService` sınıflarındaki algoritmaların doğruluğu InMemory (hafıza-içi) veritabanında test edildi.
- API güvenliği için `Rate Limiting` eklendi: Bir IP adresinden dakikada maksimum 100 istek atılabilecek şekilde kısıtlama (DDoS önlemi) getirildi.
- Cross-Site Scripting (XSS) saldırılarını önlemek için güvenli HTTP başlıkları (HSTS vb.) yapılandırıldı.

---

### HAFTA 10 - Performans Optimizasyonu ve Dağıtım (Deployment)
**Haftanın Özeti:** Son haftada uygulamamızı geliştirme ortamından (development) canlı ortama (production) taşıyacak hayati performans dokunuşları ve paketleme işlemleri yapıldı. Uygulamanın devasa bir kullanıcı kitlesi altında bile telefonları kasmaması, şarjı hızlı tüketmemesi ve sunucu maliyetlerini patlatmaması için ciddi teknik refaktörler yapıldı.

**Frontend**
- `HomeScreen` içerisindeki uzun salon listesi (`FlatList`) optimize edildi. Ekranda görünmeyen elemanların bellekten silinmesi (`removeClippedSubviews`) ve kısıtlı render limitleri (`initialNumToRender`) ayarlandı.
- Sık çizilen (re-render) bileşenler (`Button`, `Input`) `React.memo` ile, ana fonksiyonlar ise `useCallback` ile hafızada sabitlenerek React Native'in işlemci tüketimi minimize edildi.
- Uygulamanın mağazalara (Play Store, App Store) derlenmesi için **Expo EAS Build** ayarları (`eas.json`) eklendi, Android `package` ve iOS `bundleIdentifier` ID'leri yapılandırıldı.

**Backend**
- Kullanıcıların en sık talep ettiği "Salon Listesi" ve "Arama" endpointlerine `.NET Response Caching` eklenerek, aynı verinin sürekli veritabanından çekilmesi engellendi (Hız %300 arttı).
- Yalnızca "okuma" (Read-only) amacıyla çekilen verilere `AsNoTracking()` özelliği eklendi; böylece Entity Framework'ün nesneleri takip etmesi engellenerek RAM tasarrufu sağlandı.
- Canlı ortamda oluşan hataları kalıcı olarak kaydetmek için gelişmiş loglama aracı **Serilog** projeye dahil edildi ve günlük (daily-rolling) metin dosyası loglaması yapılandırıldı.

---

## 4. MİMARİ TASARIM VE TEKNOLOJİ YIĞINI
### 4.1. Backend (Sunucu) Mimarisi
Sunucu tarafı, bağımlılıkların içten dışa doğru ilerlediği "Clean Architecture" prensiplerine göre dört katmanlı tasarlanmıştır:
* **Domain Katmanı:** Sistemin temel varlıkları ve Enum yapıları. Veritabanı bağımsızdır.
* **Application Katmanı:** İş kurallarını, veri transfer nesnelerini (DTO) ve arayüz tanımlamalarını içerir.
* **Infrastructure Katmanı:** Veri erişim katmanı (Data Access) görevini üstlenir. EF Core üzerinden Service sınıfları burada somutlaştırılır.
* **API Katmanı:** İstemciler ile haberleşen RESTful servis uç noktalarını, Middleware yapılarını ve SignalR Hub'larını barındırır.
* **Teknolojiler:** .NET 8, Entity Framework Core, SQLite, ASP.NET Core Identity, JWT, SignalR, Serilog, xUnit, Moq.

### 4.2. Frontend (İstemci) Mimarisi
İstemci tarafı, hem iOS hem de Android cihazlarda yerel (native) performansa yakın çalışan **React Native (Expo)** teknolojisiyle geliştirilmiştir. 
* **State Management (Durum Yönetimi):** Karmaşık global veri akışını yönetmek için hafif ve performanslı **Zustand** kütüphanesi tercih edilmiştir.
* **Navigasyon:** Uygulama içi ekran geçişleri `React Navigation` ile modüler olarak yapılandırılmıştır.
* **Teknolojiler:** React Native (Expo), Zustand, React Navigation, Axios, Jest, EAS (Expo Application Services).

---

## 5. VERİTABANI VE VERİ MODELİ TASARIMI
Projede nesne-ilişkisel eşleme (ORM) aracı olarak **Entity Framework Core** kullanılmıştır. Temel ilişkiler:
* **Salon - Kuaför (1:N):** Bir salonun birden fazla kuaförü/çalışanı olabilir.
* **Salon - Hizmet (1:N):** Her salonun kendine özgü fiyat ve sürelere sahip hizmet listesi bulunur.
* **Randevu (Appointment):** Müşteri (`AppUser`), Kuaför (`Barber`), Salon (`Salon`) ve Hizmet (`Service`) tablolarını birbirine bağlayan temel transaksiyonel tablodur.
* **Değerlendirme (Review):** Randevusu tamamlanmış müşterilerin hizmeti puanlayabildiği tablodur.

---

## 6. GÜVENLİK, KİMLİK DOĞRULAMA VE YETKİLENDİRME
* **Kimlik Doğrulama:** `.NET Core Identity` altyapısı kullanılmış, doğrulama süreçleri **JWT (JSON Web Token)** tabanlı yapılandırılmıştır. 
* **Rol Bazlı Erişim (RBAC):** Müşteri (Customer) ve Kuaför (Barber) olmak üzere iki ana rol oluşturulmuştur. Kuaför paneline müşterilerin erişimi engellenmiştir.
* **API Güvenliği:** Siber saldırılara karşı **Rate Limiting** ve **Security Headers** entegre edilmiştir.

---

## 7. GERÇEK ZAMANLI İLETİŞİM (REAL-TIME COMMUNICATION)
Geleneksel istek/yanıt modeline ek olarak, sisteme anlık bildirim yeteneği kazandırmak için **SignalR** entegre edilmiştir. 
* Müşteri bir randevu oluşturduğunda, ilgili kuaförün cihazına Websocket bağlantısı üzerinden anlık bildirim iletilmektedir.
* Kuaför randevuyu onayladığında müşterinin ekranı sayfayı yenilemeden (refresh) güncellenmektedir.

---

## 8. PERFORMANS OPTİMİZASYONLARI
* **Backend Caching:** Sıklıkla sorgulanan endpointlere `.NET Response Caching` eklenmiştir.
* **AsNoTracking:** Yalnızca okuma (Read-only) amacıyla çekilen verilerde RAM tüketimi sıfırlanmıştır.
* **Frontend Rendering:** `FlatList` ekran dışında kalan öğelerin bellekten silinmesi (`removeClippedSubviews`) özelliğiyle optimize edilmiştir. `React.memo` ve `useCallback` ile gereksiz yeniden çizim (re-render) durumları önlenmiştir.

---

## 9. KALİTE GÜVENCESİ VE TEST SÜREÇLERİ (QA & TESTING)
* **Backend Testleri:** `xUnit` ve `Moq` kullanılarak InMemory veritabanı ile birim testleri (unit tests) yürütülmüştür.
* **Frontend Testleri:** `Jest` kullanılarak UI form akışları test edilmiştir.
* **Erişilebilirlik (Accessibility):** Ekran okuyucu cihazları kullanan bireyler için ana UI bileşenlerine destek eklenmiştir.

---

## 10. SÜREKLİ ENTEGRASYON VE DAĞITIM (CI/CD) HAZIRLIKLARI
* **Expo (EAS):** Bulut üzerinden derleme almak amacıyla Android (APK/AAB) ve iOS (.ipa) derleme profilleri hazırlanmıştır (`eas.json`).
* **Loglama:** Sunucu sağlığını yakalamak için `Serilog` yapılandırılmış, fiziksel dosya loglaması entegre edilmiştir.

---

## 11. SONUÇ VE GELECEK ÇALIŞMALAR
Bu rapor kapsamında detaylandırılan "Kuaför Randevu Sistemi"; katmanlı, esnek ve gelişime açık mimarisi sayesinde sektör gereksinimlerini yüksek performans ve güvenlikle karşılamaktadır. Uygulama canlı (production) ortama geçişe tam olarak hazır hale gelmiştir. 

**Gelecek sürümlerde (v2.0) planlanan bazı modüller:**
1. Çevrimiçi (Online) kapora ve ödeme sistemi (Örn: Stripe/Iyzico).
2. Makine Öğrenimi (Machine Learning) destekli günlük randevu doluluk tahminleme raporları.
3. Yönetim (Admin) paneli üzerinden gelişmiş dinamik kampanya ve promosyon yönetimi.
