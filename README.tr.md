<div align="center">

  <img src="./public/logo.svg" alt="NexusTweak Logo" width="100" height="100" />

  # ⚡ NexusTweak (Türkçe Dokümantasyon)
  ### Modern, Güvenli ve Yüksek Performanslı Android ADB Optimizasyon ve Yönetim Aracı

  <p align="center">
    <strong><a href="./README.md">🇬🇧 English Version</a></strong> •
    <strong><a href="#-türkçe">🇹🇷 Türkçe</a></strong>
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://v2.tauri.app/)
  [![Rust](https://img.shields.io/badge/Rust-Backend-dea584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Platform: Windows | macOS | Linux](https://img.shields.io/badge/Platform-Cross--Platform-brightgreen?style=for-the-badge)](https://github.com/burakzdgn/NexusTweak)

  <p align="center">
    <a href="#-sorumluluk-reddi-beyanı-disclaimer">Sorumluluk Reddi</a> •
    <a href="#-temel-özellikler">Özellikler</a> •
    <a href="#-oem-destek-tablosu">OEM Desteği</a> •
    <a href="#-mimari">Mimari</a> •
    <a href="#-kurulum-ve-başlatma">Kurulum</a> •
    <a href="#-üçüncü-taraf-lisans-atıfları">Lisans Atıfları</a>
  </p>

</div>

---

<a name="türkçe"></a>
## ⚠️ Sorumluluk Reddi Beyanı (Disclaimer)

> [!CAUTION]
> **KULLANIM VE UYGULAMA SORUMLULUĞU TAMAMEN KULLANICIYA AİTTİR.**
> NexusTweak, Android işletim sisteminin alt seviye ADB komutlarını, ekran çözünürlüğü ve yoğunluk ayarlarını (`wm size` / `wm density`), canlı ekran yansıtmayı, paket devre dışı bırakma (debloat) ve sistem optimizasyonlarını çalıştıran güçlü bir araçtır.
> - Bu yazılım aracılığıyla yapılan tüm değişiklikler kullanıcının kendi rızası ve sorumluluğundadır.
> - NexusTweak geliştiricileri ve katkıda bulunanlar; oluşabilecek doğrudan veya dolaylı veri kaybı, bootloop (cihazın açılmaması), donanım/yazılım kararsızlıkları veya cihaz garantisinin etkilenmesi durumunda **HİÇBİR HUKUKİ VE TEKNİK SORUMLULUK KABUL ETMEZ**.
> - Önemli işlemlerden önce her zaman bağımsız verilerinizi yedekleyiniz ve snapshot kayıtlarını kontrol ediniz.

---

## 📖 Proje Hakkında

**NexusTweak**, Android cihazlarınızı USB veya Kablosuz (Wi-Fi) ADB üzerinden derinlemesine analiz eden, scrcpy motoruyla ekran yansıtan, tek tıkla optimizasyon profilleri sunan, toplu APK yükleyip/çıkarabilen, ekran çözünürlüğü ve DPI ölçeğini ayarlayan, gereksiz üretici şişkinliklerini (bloatware) güvenle temizleyen açık kaynaklı bir masaüstü uygulamasıdır.

Tüm işlemler öncesinde **otomatik anlık görüntü (snapshot)** alınır, değişiklik farkları (diff) incelenebilir ve tek tıkla **Geri Alma (Rollback)** imkanı sunulur.

---

## ✨ Temel Özellikler

### 📱 1. Canlı Ekran Yansıtma ve Kontrol (scrcpy Entegrasyonu)
- **Sıfır Gecikmeli Akış:** 120 FPS'ye kadar yüksek akıcılıkta ekran yansıtma, tam fare jestleri ve klavye girişi.
- **Ekran Kapalı Yansıtma:** Telefonun fiziksel ekranını kapatıp görüntüyü sadece PC'de göstererek ısınmayı ve pil tüketimini engeller.
- **MP4 Video Kaydı:** Yansıtma oturumunu doğrudan `recordings/` klasörüne tek tıkla HD video kaydeder.
- **Her Zaman Üstte & Ses Kontrolü:** Yansıtma penceresini üstte sabitleme ve cihaz sesini sessize alma seçenekleri.
- **1-Tıkla scrcpy İndirici:** Sistemde scrcpy bulunmadığında resmi GitHub release paketini tek tıkla otomatik indirir.

### ⚡ 2. Tek Tıkla Optimizasyon Profilleri
- **🎮 Oyun & Yüksek Performans Modu:** Sıfır animasyon gecikmesi, 120Hz/144Hz panel kilitleme, Joyose/GOS kısıtlamalarını askıya alma, Cloudflare düşük gecikmeli DoH DNS.
- **🔋 Aşırı Pil Tasarrufu Modu:** 60Hz ekran kilidi, agresif Doze derin uyku ayarları, Wi-Fi tarama kısıtlamaları, arka plan telemetri durdurma.
- **🛡️ Maksimum Gizlilik Modu:** AdGuard şifreli reklam engelleyici DoT DNS, tanılama servislerini devre dışı bırakma, kilit ekranı reklamlarını kapatma.
- **⚖️ Dengeli Günlük Kullanım:** 0.5x akıcı animasyonlar, adaptif yenileme hızı, güvenli Cloudflare DNS.

### 📦 3. Gelişmiş APK Yönetim Paketi
- **Toplu APK Yükleyici:** Sürükle-bırak yöntemiyle birden fazla `.apk` dosyasını sıraya ekleyip tek seferde cihaza yükleme.
- **Yüklü Uygulamalardan APK Çıkarıcı (Dumper):** Cihazdaki uygulamaları arayıp ham `.apk` dosyasını tek tıkla bilgisayara (`extracted_apks/`) indirme.

### 🖥️ 4. Ekran Çözünürlüğü ve DPI Ayarlayıcı
- **Çözünürlük Ölçeklendirme (`wm size`):** FHD+ (1080p), QHD+ (1440p), HD+ (720p) veya özel çözünürlük ile GPU yükünü ve güç tüketimini azaltma.
- **DPI Yoğunluk Ayarı (`wm density`):** Arayüzü sıkılaştırma veya uygulamalarda **Tablet Modu** arayüzünü tetikleme. Tek tıkla varsayılan çözünürlük/DPI değerlerine dönme.

### 🔍 5. Derin Donanım ve Telemetri Analizi
- **Yonga Seti & İşlemci:** SoC platformu, CPU mimarisi (`arm64-v8a`), üretici, model ve derleme kimliği.
- **Ekran Telemetrisi:** Panel çözünürlüğü, piksel yoğunluğu (DPI), aktif yenileme hızı ve dinamik panel hızları (60Hz / 90Hz / 120Hz / 144Hz).
- **Batarya ve Sıcaklık Monitörü:** `dumpsys battery` üzerinden çekirdek batarya sıcaklığı (°C), voltaj (V), sağlık durumu ve şarj kaynağı.
- **Sistem Güvenlik Durumu:** Root denetimi (Magisk/KernelSU), SELinux durumu (*Enforcing/Permissive*), Android ve SDK sürümü.

### 🗑️ 6. Güvenli Debloat Yöneticisi
- **Risk Sınıflandırması:** Safe (Tamamen Güvenli), Moderate (Orta) ve Advanced (Gelişmiş) seviyeler.
- **Zararsız Devre Dışı Bırakma:** `--user 0` standardı ile ROM bölüntüsünü bozmadan kullanıcı alanında güvenli devre dışı bırakma.
- **Toplu İşlem Barı:** Seçilen tüm paketleri tek tıkla debloat edebilme.

### 🛡️ 7. 1-Click Rollback & Detaylı Diff İnceleyici
- **Otomatik Anlık Durum Kaydı:** Herhangi bir ayar uygulanmadan önce cihaz adı, tarih ve ayar değerleri `device_backups/<device_id>_<timestamp>.json` dosyasına kaydedilir.
- **Detaylı Diff İnceleyici:** Geri yükleme yapıldığında hangi ayarların ve hangi paketlerin eski haline döneceğini açıkça gösterir.
- **Kritik Whitelist:** `SystemUI`, `Launcher`, `Dialer`, `Google Play Services`, `KeyChain` ve `Settings` paketlerinin silinmesini engelleyen kilit koruması.

### 💻 8. Etkileşimli ADB Terminal Çekmecesi
- Sağ üstteki **Terminal Konsolu** butonuna basıldığında ekranın altından yukarı doğru açılan interaktif terminal çekmecesi.
- Canlı ANSI renkli log akışı ve hazır teşhis komutları (`dumpsys battery`, `wm size`, `getprop`, `pm list`).

### ⬇️ 9. 1-Tıkla Otomatik Google ADB İndirici
- Sistemde ADB kurulu olmadığında resmi Google Android sunucularından platform-tools paketini tek tıkla indirip otomatik yapılandırır.

### 📊 10. Dinamik Sistem Optimizasyon Endeksi (100/100 Kontrol Listesi)
- **Canlı Donanım ve Ayar Puanlaması:** Arayüz Akıcılığı, Gizlilik & DNS, Pil & Bekleme ve Debloat Temizliği alt puanlarının gerçek zamanlı hesaplanması.
- **100/100 Eksik Adımlar Listesi:** Kontrol panelinde tam 100/100 skora ulaşmak için gereken eksik optimizasyonları kategori bazında gösteren etkileşimli kontrol listesi.
- **Tek Tıkla Yönlendirme:** İlgili tavsiyeye tıklayarak doğrudan optimizasyon alanına geçiş yapabilme.

### 💡 11. Detaylı İnteraktif Optimizasyon Rehberleri
- Her optimizasyon kartında bulunan **`(i)` Detay Butonu** ile açılan kapsamlı rehber:
  - *Arka planda nasıl çalışır?*
  - *Sağladığı somut kazanımlar ve pil/performans artışı*
  - *Dikkat edilmesi gerekenler ve olası yan etkiler*
  - *Geri alınabilirlik durumu ve güvenlik derecesi*
  - *Çalıştırılan birebir ADB shell komutları*

### ⚡ 12. Evrensel Otomatik Senkronizasyon & Durum Filtresi
- **Durum Filtre Sekmeleri:** Optimizasyonları `Tümü`, `Uygulanmayanlar` ve `Uygulananlar (Aktif)` olarak filtreleyebilme.
- **Evrensel Otomatik Senkronizasyon:** Debloat, profil uygulama, geri yükleme (rollback) veya ekran ayarları yapıldığında cihaz durumunun, kuralların ve skorun anında baştan taranması.
- **Akıllı Bildirimler (Toasts):** Bağımsız 3.8s geri sayım süresi, görsel ilerleme çubuğu, üzerine gelince duraklama ve tek tıkla kapatma.

---

## 💾 İndirme & Sürüm Seçenekleri (Kurulum Gerekir mi?)

NexusTweak'in [GitHub Releases](https://github.com/burakzdgn/NexusTweak/releases) sayfasından indirebileceğiniz dosya türleri:

| Dosya Türü | Açıklama | Kurulum Gerekir mi? |
| :--- | :--- | :---: |
| **`NexusTweak.exe` (Portable)** | Kurulum gerektirmeyen bağımsız tek dosya. İndirip doğrudan çift tıklayarak çalıştırabilirsiniz. | ❌ Kurulum Gerektirmez |
| **`NexusTweak_x64-setup.exe` (Setup)** | Masaüstü kısayolu ve Başlat menüsü ekleyen 1-tıkla modern kurulum sihirbazı. | ✅ Hızlı Kurulum |
| **`NexusTweak_x64_en-US.msi` (MSI)** | Kurumsal veya otomatik dağıtımlar için standart Windows Installer paketi. | ✅ Standart MSI |

> [!TIP]
> Bilgisayarınıza hiçbir şey kurmak istemiyorsanız doğrudan **Portable `NexusTweak.exe`** dosyasını indirip anında optimizasyona başlayabilirsiniz!

---

## 🛠️ Kaynak Koddan Çalıştırma (Geliştiriciler İçin)

### Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üstü)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- Android Cihazda **Geliştirici Seçenekleri** ve **USB Hata Ayıklama** açık olmalıdır.

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/burakzdgn/NexusTweak.git
cd NexusTweak
```

### 2. Windows İçin Tek Tıkla Başlatma
`run.bat` dosyasına çift tıklayın veya PowerShell'de çalıştırın:
```cmd
run.bat
```

### 3. Manuel Çalıştırma
```bash
npm install
npm run tauri dev
```

### 4. Üretim Paketi (Kurulum Dosyası) Oluşturma
```bash
npm run tauri build
```
> Çıktılar `src-tauri/target/release/bundle/` klasörü altına oluşturulur (`.msi`, `.exe`, `.dmg`, `.deb`).

---

## 📜 Üçüncü Taraf Lisans Atıfları

- **[scrcpy](https://github.com/Genymobile/scrcpy)** — Ekran yansıtma ve kontrol motoru, [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) (Telif Hakkı Genymobile / Romain Vimont) altında lisanslanmıştır.
- **Google Android Platform-Tools** — Google tarafından Android Software Development Kit Lisansı ile dağıtılan resmi ADB ikilileri.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<div align="center">
  <sub>NexusTweak ile cihazınızın tam kontrolünü elinize alın. Açık kaynak topluluğu için özenle geliştirildi.</sub>
</div>
