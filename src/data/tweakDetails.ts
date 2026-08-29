export interface TweakDetailInfo {
  title: string;
  summary: string;
  howItWorks: string;
  benefits: string[];
  considerations: string;
  reversibility: string;
}

export const TWEAK_DETAILS: Record<'tr' | 'en', Record<string, TweakDetailInfo>> = {
  tr: {
    gen_anim_scale_fast: {
      title: 'Süper Hızlı Animasyonlar (0.5x)',
      summary: 'Pencere, geçiş ve animatör sürelerini yarı yarıya kısaltarak arayüzün anında ve çok daha seri tepki vermesini sağlar.',
      howItWorks: 'Android varsayılan olarak tüm uygulama açılışlarını ve pencere geçişlerini 1.0x (1000ms tabanlı) ölçekte oynatır. Bu ayar `window_animation_scale`, `transition_animation_scale` ve `animator_duration_scale` parametrelerini 0.5x değerine çeker.',
      benefits: [
        'Uygulama açılışları ve menü geçişleri iki kat hızlanır.',
        'Klavye açılma ve kapanma tepki süresi belirgin şekilde iyileşir.',
        'Görsel geçiş efektleri kaybolmaz, akıcı ve seri bir hızda oynatılır.',
      ],
      considerations: 'Sistem kararlılığına veya donanıma hiçbir zararı yoktur. Tamamen görsel hızlandırma ayarıdır.',
      reversibility: 'İstediğiniz zaman tek tıkla 1.0x varsayılan hızına döndürülebilir.',
    },
    gen_anim_scale_off: {
      title: 'Tüm Animasyonları Kapat (0.0x)',
      summary: 'Sistem geçiş efektlerini tamamen devre dışı bırakarak uygulamalar arası anında ve sıfır gecikmeli geçiş sağlar.',
      howItWorks: 'Tüm pencere ve animatör ölçeklerini 0.0 değerine eşitler. Arayüz geçiş animasyonlarını çizmek için harcanan işlemci ve GPU yükünü sıfıra indirir.',
      benefits: [
        'Ekranda hiçbir animasyon oynatılmaz; tıklanan her uygulama anında açılır.',
        'Düşük donanımlı telefonlarda GPU ve RAM rahatlar.',
        'Maksimum arayüz hızı ve seri kullanım elde edilir.',
      ],
      considerations: 'Geçiş animasyonları oynatılmadığı için pencereler anlık belirir, görsel geçişleri seven kullanıcılar için 0.5x daha dengelidir.',
      reversibility: 'İstediğiniz zaman 0.5x veya 1.0x varsayılan değerine geri alınabilir.',
    },
    gen_force_peak_refresh_rate: {
      title: 'Maksimum Ekran Yenileme Hızını Kilitle',
      summary: 'Ekran yenileme hızını panelin desteklediği en yüksek Hz değerine sabitleyerek kaydırma ve oyunlarda 60Hz\'e düşüşleri engeller.',
      howItWorks: 'Android dinamik yenileme hızı algoritması, pil tasarrufu için ekranı sürekli 60Hz\'e düşürür. Bu ayar `min_refresh_rate` değerini panelin tavan hızına eşitler.',
      benefits: [
        'Sosyal medya, tarayıcı ve menülerde gezinirken takılma ve mikrotitreme (stuttering) tamamen yok olur.',
        '90Hz/120Hz/144Hz panelin tüm akıcılığı kesintisiz hissedilir.',
        'Destekleyen oyunlarda kare düşüşleri engellenir.',
      ],
      considerations: 'Ekran sürekli yüksek frekansta çalışacağı için günlük batarya kullanımında %3-5 civarı bir tüketim artışı olabilir.',
      reversibility: 'Geri al butonuna basıldığında Android\'in dinamik adaptif frekans moduna geri döner.',
    },
    gen_private_dns_cloudflare: {
      title: 'Cloudflare Şifreli DoH DNS (1.1.1.1)',
      summary: 'Tüm internet sorgularınızı TLS üzerinden şifreleyerek 1.1.1.1 adresine yönlendirir; ISS takibini ve DNS gecikmelerini engeller.',
      howItWorks: 'Android Özel DNS (Private DNS) protokolünü `1dot1dot1dot1.cloudflare-dns.com` adresine kilitler. Tüm DNS istekleri şifrelenir ve araya üçüncü tarafların girmesi önlenir.',
      benefits: [
        'Dünyanın en hızlı DNS ağı sayesinde web sitelerinin ilk açılış süresi (lookup latency) kısalır.',
        'İnternet Servis Sağlayıcınızın (ISS) ziyaret ettiğiniz siteleri günlüklemesi engellenir.',
        'Açık Wi-Fi ağlarında DNS zehirleme (spoofing) ve sahte yönlendirme saldırılarına karşı tam koruma sağlar.',
      ],
      considerations: 'Şifreli DNS çalışması için cihazın geçerli bir internet bağlantısı olması gerekir.',
      reversibility: 'Tek tıkla Otomatik (Varsayılan) DNS moduna geri döndürülebilir.',
    },
    gen_private_dns_adguard: {
      title: 'AdGuard Reklam Engelleyici DoT DNS',
      summary: 'Sistem genelindeki DNS trafiğini filtreleyerek uygulama içi reklamları, zararlı yazılımları ve takipçileri engeller.',
      howItWorks: 'Özel DNS alanını `dns.adguard.com` adresine ayarlar. Reklam, analitik ve izleme sunucularından gelen istekler cihaz seviyesinde engellenir.',
      benefits: [
        'Ücretsiz oyunlardaki ve uygulamalardaki banner ve tam ekran reklamların büyük kısmı engellenir.',
        'Reklam verileri indirilmediği için mobil veri tasarrufu ve daha hızlı sayfa yüklemesi sağlar.',
        'Zararlı yazılım ve oltalama (phishing) sitelerine erişimi engeller.',
      ],
      considerations: 'Bazen ödüllü reklam izleyerek can/ödül veren oyunlarda ödül videoları yüklenmeyebilir.',
      reversibility: 'İstediğiniz zaman Otomatik veya Cloudflare DNS\'e çevrilebilir.',
    },
    gen_wifi_scan_throttling_disable: {
      title: 'Wi-Fi Tarama Kısıtlamasını Kapat',
      summary: 'Arka plandaki Wi-Fi tarama hız sınırını kaldırarak ağlar arası kesintisiz ve sıfır gecikmeli geçiş sağlar.',
      howItWorks: 'Android 9+ varsayılan olarak arka plandaki Wi-Fi taramalarını kısıtlar. Bu ayar `wifi_scan_throttle_enabled 0` komutu ile kısıtlamayı kaldırır.',
      benefits: [
        'Evde veya ofiste birden fazla modem/Mesh noktası varsa telefon en güçlü modeme anında ve kesintisiz geçer.',
        'Wi-Fi sinyal değişimlerinde yaşanan anlık ping fırlamaları ve paket kayıpları önlenir.',
        'İç mekanlarda Wi-Fi tabanlı konum tespiti çok daha hızlı ve hassas çalışır.',
      ],
      considerations: 'Çok sayıda konum ve arka plan uygulaması kullanılıyorsa bataryada %1 civarı önemsiz bir etki yapabilir.',
      reversibility: 'İstediğiniz zaman kısıtlama yeniden aktif edilebilir.',
    },
    gen_aggressive_doze: {
      title: 'Agresif Doze & Derin Uyku Modu',
      summary: 'Ekran kapandığında telefonun derin uyku (Doze) moduna çok daha hızlı geçmesini sağlayarak bekleme süresi pil tüketimini düşürür. (DİKKAT: WhatsApp/Instagram bildirimlerini geciktirebilir)',
      howItWorks: 'Android varsayılan olarak ekran kapandıktan sonra 30 dakika hareket sensörlerini bekler. Bu ayar `device_idle_constants` parametrelerini optimize ederek bekleme süresini 2 dakikaya indirir ve arka plan soketlerini dondurur.',
      benefits: [
        'Gece telefon boştayken şarjın %1-2\'den fazla düşmesini engeller.',
        'Ekran kapalıyken arka planda gereksiz uyanan (wakelock) uygulamaları frenler.',
        'Cihazın cepte veya masada boştayken ısınmasını ve batarya boşalmasını önler.',
      ],
      considerations: '⚠️ ÖNEMLİ BİLDİRİM UYARISI: Bu ayar ekran kapalıyken arka plan internet ve senkronizasyon soketlerini dondurur. WhatsApp, Instagram, Telegram gibi uygulamaların bildirimleri ekranı açana veya uygulamaya girene kadar gecikebilir ya da gelmeyebilir. Anlık bildirim almak sizin için kritikse bu ayarı KULLANMAYINIZ. (Bu ayarı kullanmamak optimizasyon puanınızı düşürmez).',
      reversibility: 'Tek tıkla "Geri Al" butonuna basılarak Android standart Doze zamanlamasına anında geri döndürülebilir.',
    },
    gen_disable_window_blurs: {
      title: 'Gerçek Zamanlı UI Bulanıklıklarını Kapat',
      summary: 'Bildirim paneli ve ses kontrollerindeki ağır arka plan bulanıklık efektlerini kapatarak GPU yükünü hafifletir.',
      howItWorks: '`disable_window_blurs 1` ayarıyla Android\'in dinamik gauss bulanıklık motorunu durdurur ve yerine hafif yarı saydam arka planlar kullanır.',
      benefits: [
        'Özellikle 4GB ve 6GB RAM\'li cihazlarda bildirim çubuğu açılırken yaşanan kare düşüşlerini yok eder.',
        'GPU çizim süresini kısaltır ve bellek bant genişliği tasarrufu sağlar.',
        'Arayüz genelinde daha akıcı bir tepkisellik sunar.',
      ],
      considerations: 'Bildirim paneli arkasındaki arka plan bulanık olmak yerine hafif koyu yarı saydam görünür.',
      reversibility: 'İstediğiniz zaman bulanıklık efektleri yeniden açılabilir.',
    },

    // Xiaomi / MIUI / HyperOS
    xiaomi_msa_ad_services_debloat: {
      title: 'MIUI Sistem Reklamları (MSA) Servisi',
      summary: 'MIUI ve HyperOS sistem uygulamalarında çıkan tüm sponsorlu reklamları ve telemetri toplayıcıyı devre dışı bırakır.',
      howItWorks: 'Xiaomi\'nin dahili reklam sunucusu olan `com.miui.msa.global` paketini kullanıcı seviyesinde devre dışı bırakır.',
      benefits: [
        'Dosya Yöneticisi, İndirilenler, Güvenlik ve Temalar uygulamasındaki tüm reklamlar ve önerilen uygulamalar yok olur.',
        'Arka planda reklam afişi indiren servis kapandığı için mobil veri ve RAM tasarrufu sağlanır.',
        'Kullanıcı kullanım alışkanlıklarının Xiaomi sunucularına iletilmesi engellenir.',
      ],
      considerations: 'Tamamen güvenlidir; sistemin çekirdek işlevlerine veya telefon görüşmelerine hiçbir olumsuz etkisi yoktur.',
      reversibility: 'İstediğiniz zaman tek tıkla geri yüklenebilir.',
    },
    xiaomi_joyose_throttling_disable: {
      title: 'Joyose Performans Kısıtlayıcı',
      summary: 'Oyunlarda ve ağır uygulamalarda telefon hafifçe ısındığında kare hızını (FPS) zorla düşüren termal kısıtlayıcıyı durdurur.',
      howItWorks: '`com.xiaomi.joyose` servisini devre dışı bırakır. Xiaomi\'nin erken ve yapay frekans kısma mekanizmasını engeller.',
      benefits: [
        'PUBG, Genshin Impact, Wild Rift gibi oyunlarda 5-10 dakika sonra başlayan ani FPS düşüşleri ve takılmalar engellenir.',
        'Ekranın 90Hz/120Hz oyun potansiyeli 60 FPS sınırına takılmadan tam kapasiteyle kullanılır.',
        'Dokunmatik ekran tepki süresi hızlanır.',
      ],
      considerations: 'Cihaz yapay kısıtlama yapmayacağı için uzun süreli ağır oyun seanslarında gövde 2-3 derece daha sıcak olabilir (Dahili donanım koruması güvenliği sağlamaya devam eder).',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    xiaomi_getapps_store_debloat: {
      title: 'GetApps (Mi App Mall) Kaldırma',
      summary: 'Sık sık bildirim ve indirme hatırlatıcıları gönderen Xiaomi alternatif uygulama mağazasını devre dışı bırakır.',
      howItWorks: '`com.xiaomi.mipicks` paketini devre dışı bırakır.',
      benefits: [
        'Sürekli gelen sahte güncelleme ve sponsorlu oyun bildirim spam\'ı son bulur.',
        'Arka plan RAM ve pil tüketimi önlenir.',
      ],
      considerations: 'Google Play Store birincil mağazanız olarak sorunsuz çalışmaya devam eder.',
      reversibility: 'İstendiğinde yeniden etkinleştirilebilir.',
    },
    xiaomi_mi_browser_debloat: {
      title: 'Mi Tarayıcı (Mi Browser) Kaldırma',
      summary: 'Arama çubuğu reklamları, gizlilik telemetrisi ve bildirim spamları içeren önceden yüklü Mi Tarayıcıyı kaldırır.',
      howItWorks: '`com.mi.globalbrowser` ve `com.android.browser` paketlerini kullanıcı (User 0) seviyesinde kaldırır.',
      benefits: [
        'Chrome, Brave, Firefox gibi alternatif tarayıcılara tam uyum sağlar.',
        'Arama çubuğunda ve bildirimlerde beliren Xiaomi sponsorlu öneriler ve reklamlar son bulur.',
        'Arka plan internet ve veri tüketimi engellenir.',
      ],
      considerations: 'Web sayfalarını açmak için Chrome, Brave veya Firefox gibi başka bir tarayıcının yüklü olduğundan emin olun.',
      reversibility: 'İstediğiniz zaman tek tıkla geri yüklenebilir.',
    },
    xiaomi_wallpaper_carousel_debloat: {
      title: 'Duvar Kağıdı Döngüsü (Kilit Ekranı Reklamları)',
      summary: 'Kilit ekranında beliren haberleri, dinamik reklamları ve veri tüketen görsel akışını devre dışı bırakır.',
      howItWorks: '`com.miui.android.fashiongallery` paketini kapatır.',
      benefits: [
        'Kilit ekranınız temiz, sade ve yalnızca sizin seçtiğiniz duvar kağıdıyla kalır.',
        'Mobil veri üzerinden sürekli yüksek çözünürlüklü reklam görselleri indirilmesi engellenir.',
        'Kilit ekranının açılma süresi hızlanır.',
      ],
      considerations: 'Kilit ekranında sağa kaydırarak haber okuma özelliği devre dışı kalır.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    xiaomi_mi_media_debloat: {
      title: 'Mi Video & Mi Müzik Şişkinlikleri',
      summary: 'Promosyon açılır pencereleri ve çevrimiçi reklam akışlarıyla dolu önceden yüklü Xiaomi medya oynatıcılarını temizler.',
      howItWorks: '`com.miui.videoplayer` ve `com.miui.player` paketlerini devre dışı bırakır.',
      benefits: [
        'VLC, MX Player veya Spotify gibi modern oynatıcılar kullanıyorsanız sistemdeki gereksiz yer kaplayan ve reklam basan Xiaomi oynatıcılarını temizler.',
        'Bildirim tepsisindeki gereksiz müzik ve video önerileri son bulur.',
      ],
      considerations: 'Yerel video veya müzik açmak için alternatif bir oynatıcı (örneğin VLC veya Google Dosyalar) kullanmanız önerilir.',
      reversibility: 'İstediğiniz zaman geri yüklenebilir.',
    },

    // Samsung One UI
    samsung_gos_throttling_disable: {
      title: 'Samsung Game Optimizing Service (GOS)',
      summary: 'Samsung cihazlarda oyun çözünürlüğünü ve performansını yapay olarak düşüren GOS motorunu devre dışı bırakır.',
      howItWorks: '`com.samsung.android.game.gos` paketini durdurarak oyunların işlemci ve GPU\'dan tam performans almasını sağlar.',
      benefits: [
        'Oyunlarda çözünürlük düşürme ve bulanıklaştırma engellenir.',
        'Kare hızı (FPS) dalgalanmaları ve takılmalar minimuma iner.',
        'Ekranın 120Hz hızından oyunlarda tam faydalanılır.',
      ],
      considerations: 'Ağır oyunlarda telefon bir miktar daha ısınabilir.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    samsung_bixby_suite_debloat: {
      title: 'Bixby Sesli Asistan ve Arka Plan Paketi',
      summary: 'Kullanılmayan Bixby ses tanıma, uyandırma ve arka plan ajanlarını temizleyerek bellek tasarrufu sağlar.',
      howItWorks: '`com.samsung.android.bixby.agent` ve sesli uyandırma servislerini kapatır.',
      benefits: [
        'Arka planda mikrofon dinleyen ve RAM tüketen Bixby servisleri durdurulur.',
        'Güç tuşuna basıldığında gereksiz Bixby tetiklenmesi önlenir.',
      ],
      considerations: 'Bixby sesli komutlarını aktif kullanıyorsanız kapatmamalısınız.',
      reversibility: 'İstediğiniz zaman geri yüklenebilir.',
    },
    samsung_dex_wireless_opt: {
      title: 'Samsung DeX Arka Plan Servisi',
      summary: 'Bilgisayara kablosuz masaüstü bağlantısı sağlayan DeX arka plan dinleyicisini kapatır.',
      howItWorks: '`com.sec.android.desktopmode.uiservice` paketini durdurur.',
      benefits: ['DeX kullanmayan kullanıcılar için boşta RAM ve pil tasarrufu sağlar.'],
      considerations: 'Televizyona veya bilgisayara kablosuz DeX bağlantısı yapamazsınız.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    samsung_knox_analytics_debloat: {
      title: 'Knox Tanı & Telemetri Ajanı',
      summary: 'Samsung sunucularına sistem kullanım ve analitik verilerini gönderen izleme servisini kapatır.',
      howItWorks: '`com.samsung.android.knox.analytics.uploader` servisini devre dışı bırakır.',
      benefits: ['Gizlilik artışı, arka plan veri ve pil tasarrufu.'],
      considerations: 'Kurumsal Knox güvenliğini etkilemez, yalnızca analitik yükleyicisini kapatır.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    samsung_rubin_customization_debloat: {
      title: 'Samsung Rubin Kişiselleştirme Servisi',
      summary: 'Kullanıcı alışkanlıklarını kaydeden ve hedefli öneriler üreten arka plan analiz motorunu durdurur.',
      howItWorks: '`com.samsung.android.rubin.app` paketini devre dışı bırakır.',
      benefits: ['Kullanıcı takibi son bulur, arka plan işlemci kullanımı azalır.'],
      considerations: 'Samsung özel öneri akışları devre dışı kalır.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    samsung_smartthings_debloat: {
      title: 'SmartThings Cihaz Keşif Ajanı',
      summary: 'Yakındaki Samsung IoT cihazlarını sürekli arayan ve pil tüketen SmartThings arka plan servisini kapatır.',
      howItWorks: '`com.samsung.android.easysetup` paketini kapatır.',
      benefits: ['Sürekli Bluetooth/Wi-Fi cihaz taramasını durdurarak pil tasarrufu sağlar.'],
      considerations: 'Samsung akıllı ev cihazlarını telefonunuzla yönetiyorsanız açık bırakmalısınız.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },

    // Google Pixel
    pixel_tips_tutorial_debloat: {
      title: 'Pixel İpuçları & Tanıtım Ajanı',
      summary: 'Sistem güncellemeleri sonrası beliren tanıtım bildirimlerini ve arka plan servisini kaldırır.',
      howItWorks: '`com.google.android.apps.tips` paketini devre dışı bırakır.',
      benefits: ['Gereksiz bildirim spam\'ını engeller, RAM tasarrufu sağlar.'],
      considerations: 'Hiçbir kritik sistem fonksiyonunu etkilemez.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    pixel_device_health_services: {
      title: 'Cihaz Sağlık Servisleri Telemetrisi',
      summary: 'Google sunucularına batarya ve adaptif parlaklık tanı verilerini gönderen izleme servisini durdurur.',
      howItWorks: '`com.google.android.apps.turbo` paketini kapatır.',
      benefits: ['Arka plan telemetri gönderimini durdurur, gizliliği korur.'],
      considerations: 'Adaptif pil tahminleri standart Android moduna geçer.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
    pixel_google_feedback_debloat: {
      title: 'Google Geri Bildirim & Hata Raporlayıcı',
      summary: 'Sistem kilitlenmelerinde otomatik günlük toplayan ve gönderen arka plan hata raporlayıcısını kapatır.',
      howItWorks: '`com.google.android.feedback` servisini durdurur.',
      benefits: ['Arka plan günlük toplayıcıları durdurularak sistem performansı ve gizlilik korunur.'],
      considerations: 'Google\'a otomatik çökme raporu gönderilmez.',
      reversibility: 'Tek tıkla geri yüklenebilir.',
    },
  },

  en: {
    gen_anim_scale_fast: {
      title: 'Super Fast Animations (0.5x)',
      summary: 'Halves window, transition, and animator duration scales for an immediately snappier and more responsive UI.',
      howItWorks: 'Android defaults to 1.0x (1000ms base) animation scaling. This tweak adjusts `window_animation_scale`, `transition_animation_scale`, and `animator_duration_scale` to 0.5x.',
      benefits: [
        'App launch speeds and window transitions feel twice as fast.',
        'Keyboard popup and dismiss response is noticeably accelerated.',
        'Visual transitions remain smooth without feeling sluggish.',
      ],
      considerations: 'Zero negative impact on system stability or hardware. Purely visual acceleration.',
      reversibility: 'Can be restored to 1.0x default scale with a single click.',
    },
    gen_anim_scale_off: {
      title: 'Disable All Animations (0.0x)',
      summary: 'Completely eliminates transition animations for instantaneous, zero-latency app switches.',
      howItWorks: 'Sets all animation scales to 0.0, completely bypassing GPU render overhead for transition effects.',
      benefits: [
        'Instantaneous UI switches with zero delay.',
        'Saves GPU cycles and memory bandwidth on lower-spec hardware.',
        'Absolute maximum speed for power users.',
      ],
      considerations: 'Windows appear instantaneously without easing; 0.5x is recommended for users who prefer visual transitions.',
      reversibility: 'Can be reverted to 0.5x or 1.0x at any time.',
    },
    gen_force_peak_refresh_rate: {
      title: 'Force Peak Display Refresh Rate',
      summary: 'Locks the display refresh rate to the maximum hardware Hz supported by the panel, eliminating micro-stutters during scrolling.',
      howItWorks: 'Android dynamically drops the display to 60Hz to save power. This tweak sets `min_refresh_rate` equal to peak hardware rate (e.g., 90Hz/120Hz/144Hz).',
      benefits: [
        'Silky-smooth scrolling in social media, browsers, and launcher menus.',
        'Prevents frame rate drops during touch interaction.',
        'Unlocks high refresh rate potential in supported mobile games.',
      ],
      considerations: 'Slightly higher power draw (~3-5% daily battery increase) since the panel remains at high refresh rates.',
      reversibility: 'Reverts back to Android adaptive dynamic refresh rate upon reset.',
    },
    gen_private_dns_cloudflare: {
      title: 'Cloudflare Encrypted DoH DNS (1.1.1.1)',
      summary: 'Encrypts all DNS queries over TLS to Cloudflare 1.1.1.1, preventing ISP tracking and lookup latency.',
      howItWorks: 'Locks Private DNS mode to `1dot1dot1dot1.cloudflare-dns.com`. All domain resolution is encrypted end-to-end.',
      benefits: [
        'Faster domain name resolution via Cloudflare global anycast network.',
        'Prevents ISP logging of visited domain names.',
        'Protects against DNS spoofing and man-in-the-middle attacks on public Wi-Fi.',
      ],
      considerations: 'Requires an active internet connection to resolve hostnames.',
      reversibility: 'Can be set back to Automatic (Default) with one click.',
    },
    gen_private_dns_adguard: {
      title: 'AdGuard Ad-Blocking DoT DNS',
      summary: 'Routes system DNS lookups through AdGuard to block in-app banner ads, malware, and tracking telemetry.',
      howItWorks: 'Sets Private DNS hostname to `dns.adguard.com`, sinking known tracking and advertising domains at the device level.',
      benefits: [
        'Blocks most interstitial and banner ads inside free apps and games.',
        'Reduces data consumption and accelerates page load times.',
        'Blocks malicious phishing and scam websites system-wide.',
      ],
      considerations: 'Reward videos in certain mobile games may not load while active.',
      reversibility: 'Can be easily switched back to Automatic or Cloudflare DNS.',
    },
    gen_wifi_scan_throttling_disable: {
      title: 'Disable Wi-Fi Scan Throttling',
      summary: 'Removes background Wi-Fi scan rate limits for seamless mesh roaming and instant network handoffs.',
      howItWorks: 'Android 9+ restricts background Wi-Fi scans. This tweak sets `wifi_scan_throttle_enabled 0` to enable continuous scanning.',
      benefits: [
        'Instant roaming between multi-AP and Mesh Wi-Fi routers without dropouts.',
        'Eliminates ping spikes and jitter during online gaming.',
        'Accelerates indoor Wi-Fi location acquisition.',
      ],
      considerations: 'Negligible battery impact (~1%) if many background location services are running.',
      reversibility: 'Can be re-enabled at any time.',
    },
    gen_aggressive_doze: {
      title: 'Aggressive Doze & Deep Sleep Mode',
      summary: 'Forces the device to enter deep sleep battery saving mode much faster when the screen turns off. (NOTICE: May delay WhatsApp/Instagram notifications)',
      howItWorks: 'Android defaults to waiting 30 minutes with active motion sensors before entering deep Doze. This tweak tunes `device_idle_constants` to enter deep sleep in 2 minutes, freezing background wakeups.',
      benefits: [
        'Reduces overnight standby battery drain to less than 1-2%.',
        'Stops runaway background wakelocks while the phone is in your pocket.',
        'Keeps the device cool while idle.',
      ],
      considerations: '⚠️ IMPORTANT NOTIFICATION NOTICE: Freezes background data and sync sockets while the screen is turned off. Push notifications from apps like WhatsApp, Instagram, and Telegram may be delayed or arrive only after unlocking the screen or opening the app. If timely notifications are critical, DO NOT enable this tweak. (Leaving this tweak disabled will NOT lower your optimization score).',
      reversibility: 'Reverts back to standard Android Doze timing with one click.',
    },
    gen_disable_window_blurs: {
      title: 'Disable Real-time UI Blur',
      summary: 'Disables heavy real-time background blurring effects in notification shades to reduce GPU load.',
      howItWorks: 'Sets `disable_window_blurs 1`, replacing expensive Gaussian blur shaders with lightweight translucent tints.',
      benefits: [
        'Eliminates frame drops when opening notification shade on 4GB/6GB RAM devices.',
        'Reduces GPU render overhead and memory bandwidth pressure.',
        'Improves overall UI responsiveness.',
      ],
      considerations: 'Background behind notification center appears translucent rather than blurred.',
      reversibility: 'Can be re-enabled at any time.',
    },

    // Xiaomi / MIUI / HyperOS
    xiaomi_msa_ad_services_debloat: {
      title: 'MIUI System Ads (MSA) Daemon',
      summary: 'Completely stops MIUI/HyperOS system advertisement daemon and telemetry tracking agent.',
      howItWorks: 'Disables `com.miui.msa.global` package for user 0 via ADB.',
      benefits: [
        'Removes all ads and promoted apps inside File Manager, Downloads, Security, and Themes.',
        'Saves background mobile data and RAM.',
        'Prevents user behavior analytics from reaching Xiaomi servers.',
      ],
      considerations: '100% safe with zero impact on core system features or phone calls.',
      reversibility: 'Easily re-enabled with one click.',
    },
    xiaomi_joyose_throttling_disable: {
      title: 'Joyose Performance Throttler',
      summary: 'Disables Xiaomi background thermal throttler that aggressively caps frame rates in games and heavy tasks.',
      howItWorks: 'Disables `com.xiaomi.joyose` to prevent early synthetic CPU/GPU downclocking.',
      benefits: [
        'Prevents sudden FPS drops and stuttering in PUBG, Genshin Impact, Wild Rift, etc.',
        'Unlocks full 90Hz/120Hz gaming potential without 60 FPS artificial cap.',
        'Improves touch sampling response latency.',
      ],
      considerations: 'The phone may feel 2-3°C warmer during long gaming sessions as it maintains peak performance.',
      reversibility: 'Easily re-enabled with one click.',
    },
    xiaomi_getapps_store_debloat: {
      title: 'GetApps (Mi App Mall) Debloat',
      summary: 'Disables Xiaomi alternative app store that sends frequent push spam notifications and download reminders.',
      howItWorks: 'Disables `com.xiaomi.mipicks`.',
      benefits: [
        'Stops spam notifications for promoted apps and games.',
        'Frees background RAM and battery.',
      ],
      considerations: 'Google Play Store continues to work flawlessly as primary store.',
      reversibility: 'Can be re-enabled at any time.',
    },
    xiaomi_mi_browser_debloat: {
      title: 'Mi Browser Debloat',
      summary: 'Removes pre-installed Xiaomi Mi Browser loaded with search bar ads, tracking telemetry, and news notifications.',
      howItWorks: 'Uninstalls `com.mi.globalbrowser` and `com.android.browser` for user 0.',
      benefits: [
        'Eliminates sponsored recommendation cards and push notifications.',
        'Improves privacy by cutting Xiaomi browser telemetry.',
        'Saves background memory and mobile bandwidth.',
      ],
      considerations: 'Ensure you have another web browser installed (e.g., Google Chrome, Firefox, Brave).',
      reversibility: 'Can be reinstalled and enabled with one click.',
    },
    xiaomi_wallpaper_carousel_debloat: {
      title: 'Wallpaper Carousel (Lockscreen Ads)',
      summary: 'Removes lockscreen dynamic news feed and sponsored wallpapers that consume mobile data and battery.',
      howItWorks: 'Disables `com.miui.android.fashiongallery`.',
      benefits: [
        'Clean, private lockscreen with only your chosen wallpaper.',
        'Prevents background downloading of sponsored high-res images.',
        'Accelerates lockscreen wake time.',
      ],
      considerations: 'Swiping right on lockscreen for news feed will be disabled.',
      reversibility: 'Can be re-enabled with one click.',
    },
    xiaomi_mi_media_debloat: {
      title: 'Mi Video & Mi Music Bloatware',
      summary: 'Removes pre-installed Xiaomi media players riddled with promotional popups and online streams.',
      howItWorks: 'Disables `com.miui.videoplayer` and `com.miui.player`.',
      benefits: [
        'Removes clutter and intrusive stream promotions.',
        'Frees up storage and RAM.',
      ],
      considerations: 'Recommend using VLC, MX Player, or Spotify for media playback.',
      reversibility: 'Can be re-enabled at any time.',
    },

    // Samsung One UI
    samsung_gos_throttling_disable: {
      title: 'Samsung Game Optimizing Service (GOS)',
      summary: 'Disables Samsung GOS throttling engine that degrades game resolution and frame rates.',
      howItWorks: 'Disables `com.samsung.android.game.gos` for user 0.',
      benefits: [
        'Prevents downscaling and blurring in 3D games.',
        'Stabilizes frame rate delivery and reduces jitter.',
        'Maximizes 120Hz display smoothness in games.',
      ],
      considerations: 'Device may run slightly warmer during extended gaming.',
      reversibility: 'Can be re-enabled at any time.',
    },
    samsung_bixby_suite_debloat: {
      title: 'Bixby Virtual Assistant & Voice Suite',
      summary: 'Disables unused Bixby voice recognition, wake-up listeners, and background agents.',
      howItWorks: 'Disables `com.samsung.android.bixby.agent`.',
      benefits: [
        'Frees memory and stops background microphone listening.',
        'Prevents accidental Bixby activations on power button press.',
      ],
      considerations: 'Do not disable if you actively use Bixby voice commands.',
      reversibility: 'Can be re-enabled at any time.',
    },
    samsung_dex_wireless_opt: {
      title: 'Samsung DeX Background Daemon',
      summary: 'Disables background DeX wireless desktop connection listener.',
      howItWorks: 'Disables `com.sec.android.desktopmode.uiservice`.',
      benefits: ['Saves standby RAM and battery for users who do not use DeX.'],
      considerations: 'Cannot launch wireless DeX on TV or PC while disabled.',
      reversibility: 'Can be re-enabled at any time.',
    },
    samsung_knox_analytics_debloat: {
      title: 'Knox Diagnostic & Telemetry Agent',
      summary: 'Disables analytics uploader transmitting system usage metrics to Samsung servers.',
      howItWorks: 'Disables `com.samsung.android.knox.analytics.uploader`.',
      benefits: ['Enhances privacy and reduces background data transfers.'],
      considerations: 'Does not compromise enterprise Knox security features.',
      reversibility: 'Can be re-enabled at any time.',
    },
    samsung_rubin_customization_debloat: {
      title: 'Samsung Rubin Customization Service',
      summary: 'Disables background behavior analysis engine generating targeted suggestions.',
      howItWorks: 'Disables `com.samsung.android.rubin.app`.',
      benefits: ['Stops user habit tracking and reduces idle CPU activity.'],
      considerations: 'Samsung personalized recommendation widgets will be disabled.',
      reversibility: 'Can be re-enabled at any time.',
    },
    samsung_smartthings_debloat: {
      title: 'SmartThings Background Discovery Hub',
      summary: 'Disables continuous background discovery for nearby Samsung IoT devices.',
      howItWorks: 'Disables `com.samsung.android.easysetup`.',
      benefits: ['Stops continuous Bluetooth/Wi-Fi scanning to conserve battery.'],
      considerations: 'Keep enabled if you manage SmartThings home devices on your phone.',
      reversibility: 'Can be re-enabled at any time.',
    },

    // Google Pixel
    pixel_tips_tutorial_debloat: {
      title: 'Pixel Tips & Onboarding Agent',
      summary: 'Disables showcase tutorial popups and onboarding notifications after OS updates.',
      howItWorks: 'Disables `com.google.android.apps.tips`.',
      benefits: ['Eliminates notification clutter and frees RAM.'],
      considerations: 'Zero impact on core Pixel functionality.',
      reversibility: 'Can be re-enabled at any time.',
    },
    pixel_device_health_services: {
      title: 'Device Health Services Telemetry',
      summary: 'Disables telemetry uploader sending battery diagnostics to Google servers.',
      howItWorks: 'Disables `com.google.android.apps.turbo`.',
      benefits: ['Improves privacy and prevents telemetry wakeups.'],
      considerations: 'Adaptive battery estimates revert to standard Android baseline.',
      reversibility: 'Can be re-enabled at any time.',
    },
    pixel_google_feedback_debloat: {
      title: 'Google Feedback & Crash Reporter',
      summary: 'Disables automated crash log collector and feedback uploader.',
      howItWorks: 'Disables `com.google.android.feedback`.',
      benefits: ['Saves CPU cycles by stopping background diagnostic loggers.'],
      considerations: 'Automated crash reports will not be sent to Google.',
      reversibility: 'Can be re-enabled at any time.',
    },
  },
};

export function getTweakDetail(ruleId: string, lang: 'tr' | 'en'): TweakDetailInfo | null {
  return TWEAK_DETAILS[lang]?.[ruleId] || null;
}
