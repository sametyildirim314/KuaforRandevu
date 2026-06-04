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
Proje, her bir haftası belirli bir modüle ve kilometre taşına (milestone) odaklanan 10 haftalık sistematik bir sprint yapısında geliştirilmiştir:

### Hafta 1: Proje Kurulumu ve Mimari Tasarım
* Backend tarafında **.NET 8** kullanılarak bağımlılıkların içten dışa doğru aktığı **Clean Architecture (Temiz Mimari)** katmanları (Domain, Application, Infrastructure, API) oluşturuldu.
* Frontend tarafında **React Native (Expo)** başlatıldı. Tasarım dili (Typography, Colors) ve klasör hiyerarşisi standartlaştırıldı.
* Veritabanı bağlantısı **Entity Framework Core** ve geliştirme hızı sağlaması adına **SQLite** üzerinden yapılandırıldı.

### Hafta 2: Kimlik Doğrulama ve Güvenlik (Authentication & Security)
* `.NET Core Identity` kullanılarak kullanıcı yönetimi oluşturuldu.
* Güvenli iletişim için **JWT (JSON Web Token)** mekanizması entegre edildi.
* "Müşteri" (Customer) ve "Kuaför" (Barber) olmak üzere sistemde **Rol Bazlı Erişim (RBAC)** yapısı kurgulandı.
* Frontend'de durum yönetimi (state management) için **Zustand** kütüphanesi kullanılarak `authStore` oluşturuldu ve giriş/kayıt arayüzleri tamamlandı.

### Hafta 3: Çekirdek Randevu Modeli ve API Tasarımı
* İş alanının temeli olan `Salon`, `Barber`, `Service` ve `Appointment` varlıkları (Entity) arasındaki ilişkisel veritabanı haritalamaları (One-to-Many ilişkiler) yapıldı.
* Veri transfer nesneleri (DTO) ve arayüzler (Interfaces) kullanılarak RESTful API uç noktaları yazıldı.
* API dokümantasyonu için **Swagger** entegre edildi.

### Hafta 4: Mobil Navigasyon ve Temel Arayüzler
* React Navigation ile uygulamaya "Bottom Tab Navigator" (Alt sekmeler) ve "Native Stack Navigator" (Sayfa yığınları) eklendi.
* Müşteriler için ana sayfa (Home Screen) tasarlandı; gelişmiş salon arama, puan filtreleme ve önerilen salonlar bileşenleri dinamik verilerle bağlandı.
* Dinamik liste tasarımları için `FlatList` entegrasyonu sağlandı.

### Hafta 5: Randevu Oluşturma Akışı (Booking Flow)
* Karmaşık bir iş mantığı gerektiren "Boş Saat Dilimi (Time Slot) Hesaplama" algoritması backend tarafında başarıyla kodlandı.
* Müşterinin Kuaför, Hizmet türü, Tarih ve Saat seçimini adım adım yapabildiği randevu alma (Booking) arayüzü entegre edildi.
* Çakışan randevuları (Double-booking) önleyen iş kuralları sisteme dahil edildi.

### Hafta 6: Gerçek Zamanlı Bildirimler (SignalR)
* Geleneksel istek-yanıt (HTTP) modeli yerine **WebSockets** tabanlı gerçek zamanlı iletişim sağlayan **SignalR** projeye entegre edildi.
* Müşteri randevu aldığında, saniyeler içinde kuaförün cihazına anlık bildirim (Push-like notification) düşmesi sağlandı.

### Hafta 7: Kuaför Yönetim Paneli (Barber Dashboard)
* Kuaförlerin gelen randevuları anlık olarak görebildiği, "Bekliyor, Onaylandı, İptal, Tamamlandı" statülerine göre filtreleyebildiği özel Dashboard arayüzü kodlandı.
* Kuaförlerin müşterilerin notlarını okuyabildiği ve statü değişiklikleri (Onay/İptal) yapabildiği yönetim yetkileri API üzerinden güvenliğe alındı.

### Hafta 8: Finans, Raporlama ve Değerlendirme Modülü
* Kuaförlerin Günlük, Haftalık ve Aylık gelir (Earnings) hesaplamalarını dinamik olarak sunan istatistik servisleri yazıldı.
* Müşterilerin tamamlanan hizmetler sonrası kuaföre Puan ve Yorum verebilmesini (Review System) sağlayan değerleme modülü aktif edildi.
* Barber Portfolio (Kuaför Profili) ekranı ile bu yorumların şeffaf şekilde listelenmesi sağlandı.

### Hafta 9: Kalite Güvencesi ve Test (QA & Testing)
* Backend tarafında **xUnit** ve **Moq** kütüphaneleriyle birim testler (Unit Tests) yazılarak InMemory veritabanı üzerinden test coverage artırıldı.
* API'nin siber saldırılardan korunması için **Rate Limiting** (dakikada kısıtlı istek) ve Security Headers (X-Frame-Options vb.) eklendi.
* Frontend tarafında **Jest** ve Testing Library ile kritik UI bileşenleri ve akışlar test edildi; erişilebilirlik (Accessibility) propları bileşenlere dahil edildi.

### Hafta 10: Performans Optimizasyonu ve Dağıtım (Deployment)
* Backend'de nadir değişen sorgular için **Response Caching** (önbellekleme) aktif edildi; okunur verilerde (Read-only) Entity Framework'ün bellek tüketimini azaltmak için `AsNoTracking()` stratejisi uygulandı.
* Sistemin hata ve analiz logları için profesyonel **Serilog** altyapısı kuruldu.
* Frontend'de listelerin kasmaması adına `FlatList` ayarları optimize edildi; gereksiz render'ları durdurmak için `React.memo` ve `useCallback` teknikleri kullanıldı.
* Uygulamanın marketlere (Play Store, App Store) gönderilmesi için **Expo EAS Build** ayarları (`eas.json` ve App ID) tamamlanarak proje canlı ortama (Production) tam hazır hale getirildi.

---

## 4. MİMARİ TASARIM VE TEKNOLOJİ YIĞINI
### 4.1. Backend (Sunucu) Mimarisi
Sunucu tarafı, bağımlılıkların içten dışa doğru ilerlediği "Clean Architecture" prensiplerine göre dört katmanlı tasarlanmıştır:
* **Domain Katmanı:** Sistemin temel varlıkları ve Enum yapıları (`User`, `Barber`, `Salon`, `Appointment`, `Service`, `Review`). Veritabanı bağımsızdır.
* **Application Katmanı:** İş kurallarını, veri transfer nesnelerini (DTO) ve arayüz (Interface) tanımlamalarını içerir.
* **Infrastructure Katmanı:** Veri erişim katmanı (Data Access) görevini üstlenir. Entity Framework Core üzerinden Repository desenleri (Service sınıfları) burada somutlaştırılır.
* **API Katmanı:** İstemciler ile haberleşen RESTful servis uç noktalarını (Controllers), Middleware (Ara katman) yapılarını ve SignalR Hub'larını barındırır.
* **Teknolojiler:** .NET 8 (ASP.NET Core Web API), Entity Framework Core, SQLite, ASP.NET Core Identity, JWT, SignalR, Serilog, xUnit, Moq.

### 4.2. Frontend (İstemci) Mimarisi
İstemci tarafı, hem iOS hem de Android cihazlarda yerel (native) performansa yakın çalışan **React Native (Expo)** teknolojisiyle geliştirilmiştir. 
* **State Management (Durum Yönetimi):** Karmaşık global veri akışını yönetmek için hafif ve performanslı **Zustand** kütüphanesi tercih edilmiştir (`authStore`, `appointmentStore`).
* **Navigasyon:** Uygulama içi ekran geçişleri `React Navigation` ile (Stack ve Bottom Tab Navigator birleşiminde) modüler olarak yapılandırılmıştır.
* **Teknolojiler:** React Native (Expo), Zustand, React Navigation, Axios, Jest, EAS (Expo Application Services).

---

## 5. VERİTABANI VE VERİ MODELİ TASARIMI
Projede nesne-ilişkisel eşleme (ORM) aracı olarak **Entity Framework Core (EF Core)** kullanılmıştır. Temel ilişkiler:
* **Salon - Kuaför (One-to-Many):** Bir salonun birden fazla kuaförü/çalışanı olabilir.
* **Salon - Hizmet (One-to-Many):** Her salonun kendine özgü fiyat ve sürelere sahip hizmet listesi bulunur.
* **Randevu (Appointment):** Müşteri (`AppUser`), Kuaför (`Barber`), Salon (`Salon`) ve Hizmet (`Service`) tablolarını birbirine bağlayan temel transaksiyonel tablodur.
* **Değerlendirme (Review):** Randevusu tamamlanmış müşterilerin hizmeti puanlayabildiği geribildirim mekanizmasıdır.

---

## 6. GÜVENLİK, KİMLİK DOĞRULAMA VE YETKİLENDİRME
* **Kimlik Doğrulama:** `.NET Core Identity` altyapısı kullanılmış, kullanıcı doğrulama süreçleri **JWT (JSON Web Token)** tabanlı olarak yapılandırılmıştır. 
* **Rol Bazlı Erişim (RBAC):** Müşteri (Customer) ve Kuaför (Barber) olmak üzere iki ana rol oluşturulmuştur. Kuaför paneli uç noktalarına müşterilerin erişimi sistem bazında engellenmiştir (`[Authorize(Roles = "Barber")]`).
* **API Güvenliği:** Siber saldırılara (DDoS, Brute-Force) karşı **Rate Limiting** (dakikada 100 istek limiti) ve **Security Headers** (X-XSS-Protection, HSTS, X-Frame-Options) ara katmanları (middleware) entegre edilmiştir.

---

## 7. GERÇEK ZAMANLI İLETİŞİM (REAL-TIME COMMUNICATION)
Geleneksel istek/yanıt modeline ek olarak, sisteme anlık bildirim yeteneği kazandırmak için **SignalR** entegre edilmiştir. 
* Müşteri bir randevu oluşturduğunda, ilgili kuaförün cihazına Websocket bağlantısı üzerinden milisaniyeler içinde anlık bildirim iletilmektedir.
* Kuaför randevuyu onayladığında veya iptal ettiğinde müşterinin ekranı anlık olarak güncellenmektedir.

---

## 8. PERFORMANS OPTİMİZASYONLARI
* **Backend Caching:** Sıklıkla sorgulanan ve nadir güncellenen endpointlere (Salon Listesi, Arama) `.NET Response Caching` eklenerek veritabanı yükü hafifletilmiştir.
* **AsNoTracking:** Yalnızca okuma (Read-only) amacıyla çekilen verilerde `AsNoTracking()` metodu kullanılarak RAM tüketimi ve Change Tracker maliyeti sıfırlanmıştır.
* **Frontend Rendering:** Uzun listelerde (`FlatList`), ekranın dışında kalan öğelerin bellekten silinmesi (`removeClippedSubviews`), `initialNumToRender` ve `windowSize` ayarları yapılandırılmıştır. Ayrıca `React.memo` ve `useCallback` kancalarıyla gereksiz yeniden çizim (re-render) durumları önlenmiştir.

---

## 9. KALİTE GÜVENCESİ VE TEST SÜREÇLERİ (QA & TESTING)
* **Backend Testleri:** `xUnit` ve `Moq` kullanılarak `AuthService` ve `BarberDashboardService` üzerinde InMemory veritabanı ile birim testleri (unit tests) yürütülmüştür.
* **Frontend Testleri:** `Jest` ve `React Native Testing Library` kullanılarak UI bileşenleri ve form akışları entegrasyon testlerinden geçirilmiştir.
* **Erişilebilirlik (Accessibility):** Ekran okuyucu cihazları kullanan bireyler için tüm ana UI bileşenlerine (`accessibilityLabel`, `accessibilityRole`) destek eklenmiştir.

---

## 10. SÜREKLİ ENTEGRASYON VE DAĞITIM (CI/CD) HAZIRLIKLARI
* **Expo Application Services (EAS):** Bulut üzerinden derleme almak amacıyla `eas.json` yapılandırma dosyası oluşturulmuş; Android (APK/AAB) ve iOS (.ipa) derleme profilleri hazırlanmıştır.
* **Loglama:** Sunucu sağlığını ve istisnaları yakalamak için `Serilog` yapılandırılmış olup, günlük rotasyonlarla çalışan fiziksel dosya loglaması entegre edilmiştir.

---

## 11. SONUÇ VE GELECEK ÇALIŞMALAR (CONCLUSION & FUTURE WORK)
Bu rapor kapsamında detaylandırılan "Kuaför Randevu Sistemi"; katmanlı, esnek ve gelişime açık mimarisi sayesinde sektör gereksinimlerini yüksek performans ve güvenlikle karşılamaktadır. Gerçekleştirilen performans optimizasyonları ve QA süreçleri ile uygulama canlı (production) ortama geçişe tam olarak hazır hale gelmiştir. 

**Gelecek sürümlerde (v2.0) planlanan bazı modüller şunlardır:**
1. Stripe veya Iyzico entegrasyonu ile çevrimiçi (Online) kapora ve ödeme sistemi.
2. Kuaförler için Machine Learning (Makine Öğrenimi) destekli günlük randevu doluluk tahminleme raporları.
3. Yönetim (Admin) paneli üzerinden gelişmiş dinamik kampanya ve promosyon yönetimi.
