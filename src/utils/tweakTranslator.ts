import { TweakRule, TweakCategory, RiskLevel } from '../types/tweaks';
import { OptimizationProfile } from '../types/profiles';

export interface TranslatedTweak {
  name: string;
  description: string;
}

export function translateTweakRule(rule: TweakRule, lang: 'tr' | 'en'): TranslatedTweak {
  if (lang === 'en') {
    return { name: rule.name, description: rule.description };
  }

  // Dynamic Refresh Rate rule (e.g. "Force Peak 90Hz Refresh Rate")
  if (rule.id === 'gen_force_peak_refresh_rate') {
    const match = rule.name.match(/(\d+)Hz/);
    const hz = match ? match[1] : '90';
    return {
      name: `Maksimum ${hz}Hz Ekran Hızını Kilitle`,
      description: `Ekran yenileme hızını sürekli ${hz}Hz'e sabitleyerek kaydırma ve arayüz gezinmelerinde 60Hz'e düşüşü ve takılmaları önler.`,
    };
  }

  const translationsTr: Record<string, TranslatedTweak> = {
    gen_anim_scale_fast: {
      name: 'Süper Hızlı Animasyonlar (0.5x)',
      description: 'Pencere, geçiş ve animatör süre ölçeklerini 0.5x seviyesine düşürerek anında daha seri ve tepkisel bir arayüz sağlar.',
    },
    gen_anim_scale_off: {
      name: 'Tüm Animasyonları Kapat (0.0x)',
      description: 'Sistem animasyonlarını tamamen devre dışı bırakarak uygulamalar arası anında geçiş ve maksimum hız elde eder.',
    },
    gen_private_dns_cloudflare: {
      name: 'Cloudflare Şifreli DoH DNS (1.1.1.1)',
      description: 'DNS sorgularını TLS üzerinden 1.1.1.1 adresine yönlendirir; daha düşük gecikme, şifreli sorgular ve ISS takibini engelleme sağlar.',
    },
    gen_private_dns_adguard: {
      name: 'AdGuard Reklam Engelleyici DoT DNS',
      description: 'Sistem genelindeki DNS trafiğini AdGuard üzerinden geçirerek uygulama içi reklamları, zararlı yazılımları ve izleyicileri engeller.',
    },
    gen_wifi_scan_throttling_disable: {
      name: 'Wi-Fi Tarama Kısıtlamasını Kapat',
      description: 'Sürekli arka plan Wi-Fi taramasına izin verir; ağlar arası daha hızlı geçiş ve anlık sinyal gücü doğruluğu sağlar.',
    },
    gen_aggressive_doze: {
      name: 'Agresif Doze & Derin Uyku',
      description: 'Ekran kapandığında derin uyku pil tasarrufu moduna hızlıca geçer. (⚠️ Dikkat: WhatsApp/Instagram bildirimleri ekran açılana kadar gecikebilir).',
    },
    gen_disable_window_blurs: {
      name: 'Gerçek Zamanlı UI Bulanıklıklarını Kapat',
      description: 'Bildirim paneli ve ses kaydırıcılarındaki gerçek zamanlı arka plan bulanıklık efektlerini kapatarak GPU ve bellek yükünü hafifletir.',
    },

    // Xiaomi / MIUI / HyperOS
    xiaomi_msa_ad_services_debloat: {
      name: 'MIUI Sistem Reklamları (MSA) Servisi',
      description: 'MIUI/HyperOS sistem reklam motorunu ve telemetri izleme arka plan ajanını tamamen devre dışı bırakır.',
    },
    xiaomi_mi_browser_debloat: {
      name: 'Mi Tarayıcı (Mi Browser) Kaldırma',
      description: 'Arama çubuğu reklamları, gizlilik telemetrisi ve bildirim spamları içeren önceden yüklü Mi Tarayıcıyı kaldırır.',
    },
    xiaomi_joyose_throttling_disable: {
      name: 'Joyose Performans Kısıtlayıcı',
      description: 'Oyunlarda ve ağır uygulamalarda kare hızını (FPS) zorla düşüren Xiaomi Joyose termal kısıtlama servisini durdurur.',
    },
    xiaomi_getapps_store_debloat: {
      name: 'GetApps (Mi App Mall) Kaldırma',
      description: 'Sık sık bildirim ve indirme hatırlatıcıları gönderen Xiaomi alternatif uygulama mağazasını devre dışı bırakır.',
    },
    xiaomi_wallpaper_carousel_debloat: {
      name: 'Duvar Kağıdı Döngüsü (Kilit Ekranı Reklamları)',
      description: 'Kilit ekranında beliren sponsorlu haberleri, dinamik reklamları ve veri tüketen görsel akışını devre dışı bırakır.',
    },
    xiaomi_mi_media_debloat: {
      name: 'Mi Video & Mi Müzik Şişkinlikleri',
      description: 'Promosyon açılır pencereleri ve çevrimiçi reklam akışlarıyla dolu önceden yüklü Xiaomi medya oynatıcılarını kaldırır.',
    },

    // Samsung One UI
    samsung_gos_throttling_disable: {
      name: 'Samsung Game Optimizing Service (GOS)',
      description: 'Oyunlarda çözünürlüğü ve performansı agresif şekilde düşüren Samsung GOS kısıtlama motorunu devre dışı bırakır.',
    },
    samsung_bixby_suite_debloat: {
      name: 'Bixby Sesli Asistan ve Arka Plan Paketi',
      description: 'Kullanılmayan Bixby ses tanıma, uyandırma ve arka plan ajanlarını temizleyerek bellek tasarrufu sağlar.',
    },
    samsung_dex_wireless_opt: {
      name: 'Samsung DeX Arka Plan Servisi',
      description: 'DeX kullanmıyorsanız arka planda çalışan kablosuz DeX bağlantı dinleyicisini devre dışı bırakır.',
    },
    samsung_knox_analytics_debloat: {
      name: 'Knox Tanı & Telemetri Ajanı',
      description: 'Samsung sunucularına sistem kullanım verilerini gönderen Knox analitik ve hata raporlama servisini kapatır.',
    },
    samsung_rubin_customization_debloat: {
      name: 'Samsung Rubin Kişiselleştirme Servisi',
      description: 'Kullanıcı alışkanlıklarını kaydeden ve hedefli öneriler üreten arka plan analiz motorunu durdurur.',
    },
    samsung_smartthings_debloat: {
      name: 'SmartThings Cihaz Keşif Ajanı',
      description: 'Yakındaki Samsung IoT cihazlarını sürekli arayan ve pil tüketen SmartThings arka plan servisini kapatır.',
    },

    // Google Pixel
    pixel_tips_tutorial_debloat: {
      name: 'Pixel İpuçları & Tanıtım Ajanı',
      description: 'Sistem güncellemeleri sonrası beliren ipucu bildirimlerini ve arka plan tanıtım servisini kaldırır.',
    },
    pixel_device_health_services: {
      name: 'Cihaz Sağlık Servisleri Telemetrisi',
      description: 'Google sunucularına batarya ve adaptif parlaklık tanı verilerini gönderen izleme servisini durdurur.',
    },
    pixel_google_feedback_debloat: {
      name: 'Google Geri Bildirim & Hata Raporlayıcı',
      description: 'Sistem kilitlenmelerinde otomatik günlük toplayan ve gönderen arka plan hata raporlayıcısını kapatır.',
    },
  };

  return translationsTr[rule.id] || { name: rule.name, description: rule.description };
}

export function translateCategory(cat: TweakCategory | string, lang: 'tr' | 'en'): string {
  if (lang === 'en') {
    switch (cat) {
      case 'all': return 'All';
      case 'animations': return 'Animations';
      case 'display': return 'Display & Hz';
      case 'battery': return 'Battery & Doze';
      case 'privacy': return 'Privacy & DNS';
      case 'performance': return 'Performance';
      case 'network': return 'Network & Wi-Fi';
      case 'debloat': return 'Debloat';
      default: return cat;
    }
  }

  switch (cat) {
    case 'all': return 'Tümü';
    case 'animations': return 'Animasyonlar';
    case 'display': return 'Ekran & Hz';
    case 'battery': return 'Batarya & Doze';
    case 'privacy': return 'Gizlilik & DNS';
    case 'performance': return 'Performans';
    case 'network': return 'Ağ & Wi-Fi';
    case 'debloat': return 'Debloat & Temizlik';
    default: return cat;
  }
}

export function translateRisk(risk: RiskLevel | string, lang: 'tr' | 'en'): string {
  if (lang === 'en') {
    switch (risk) {
      case 'Safe': return 'SAFE';
      case 'Moderate': return 'MODERATE';
      case 'Advanced': return 'ADVANCED';
      default: return String(risk).toUpperCase();
    }
  }

  switch (risk) {
    case 'Safe': return 'GÜVENLİ';
    case 'Moderate': return 'ORTA RİSK';
    case 'Advanced': return 'İLERİ DÜZEY';
    default: return String(risk).toUpperCase();
  }
}

export function translateProfile(profile: OptimizationProfile, lang: 'tr' | 'en'): { name: string; description: string } {
  if (lang === 'en') {
    return { name: profile.name, description: profile.description };
  }

  const profileMap: Record<string, { name: string; description: string }> = {
    gaming_ultra: {
      name: 'Oyun & Maksimum Performans',
      description: 'Animasyon gecikmelerini sıfırlar, ekranı panelin en yüksek Hz değerine kilitler, OEM termal kısıtlayıcılarını kapatır ve düşük gecikmeli DoH DNS ayarlar.',
    },
    battery_extreme: {
      name: 'Aşırı Pil Tasarrufu',
      description: 'Ekranı standart 60Hz\'e sabitler, agresif Doze derin uyku modunu etkinleştirir (anlık bildirimler gecikebilir), Wi-Fi tarama kısıtlamasını açar ve arka plan telemetrisini durdurur.',
    },
    privacy_hardened: {
      name: 'Maksimum Gizlilik & Reklam Engelleyici',
      description: 'AdGuard şifreli DNS (DoT) kurar, sistem reklam ajanlarını temizler, kilit ekranı reklam akışlarını kapatır ve izleyicileri engeller.',
    },
    balanced_daily: {
      name: 'Dengeli Günlük Kullanım',
      description: 'Akıcı 0.5x arayüz geçişleri, dinamik yenileme hızı, Cloudflare şifreli gizlilik DNS\'i ve sistem kararlılığını koruyan dengeli optimizasyon.',
    },
  };

  return profileMap[profile.id] || { name: profile.name, description: profile.description };
}

export function translateBloatCategory(cat: string | null | undefined, lang: 'tr' | 'en'): string {
  if (!cat) return '';
  if (lang === 'en') return cat;

  if (cat.includes('OEM Telemetry') || cat.includes('Bloatware')) {
    return 'OEM Telemetri & Şişkinlik';
  }
  if (cat.includes('Diagnostics') || cat.includes('Telemetry')) {
    return 'Sistem Tanılama & Telemetri';
  }
  return cat;
}

export function translateBloatDescription(desc: string | null | undefined, lang: 'tr' | 'en'): string {
  if (!desc) return '';
  if (lang === 'en') return desc;

  const descMap: Record<string, string> = {
    'Ad network and sponsored recommendation pusher': 'Sistem reklam ağı ve sponsorlu öneri dağıtıcısı',
    'Xiaomi user behavior and diagnostics analytics': 'Xiaomi kullanıcı davranışı ve sistem tanı analitiği',
    'Xiaomi Joyose thermal throttler and FPS capper': 'Xiaomi Joyose termal kısıtlayıcı ve oyun FPS sınırlayıcısı',
    'Xiaomi alternative app store and push notifications': 'Xiaomi alternatif uygulama mağazası ve bildirim servisi',
    'Lockscreen dynamic news and wallpaper ads': 'Kilit ekranı dinamik haber ve sponsorlu duvar kağıdı reklamları',
    'Pre-installed video player with promotional streams': 'Promosyon akışları içeren önceden yüklü Mi Video oynatıcısı',
    'Pre-installed music streaming player with ads': 'Reklamlı önceden yüklü Mi Müzik çalar servisi',
    'Xiaomi bug reporter and log uploader': 'Xiaomi hata günlüğü toplayıcı ve gönderici ajan',
    'Xiaomi yellowpages caller lookup and online services': 'Xiaomi çevrimiçi arayan kimliği ve rehber servisi',
    'Samsung Game Optimizing Service throttling engine': 'Samsung Game Optimizing Service (GOS) oyun kısıtlama motoru',
    'Samsung Bixby voice assistant and background agent': 'Samsung Bixby sesli asistan ve arka plan servisi',
    'Samsung DeX wireless bridge background service': 'Samsung DeX kablosuz bağlantı arka plan dinleyicisi',
    'Knox diagnostics and telemetry upload service': 'Knox tanı ve telemetri yükleme servisi',
    'Samsung Rubin user behavior and customization service': 'Samsung Rubin kullanıcı davranışı ve kişiselleştirme motoru',
    'SmartThings device discovery background daemon': 'SmartThings cihaz keşfi arka plan servisi',
    'Samsung Pay stub and NFC wallet service': 'Samsung Pay ödeme ve cüzdan servisi',
    'Microsoft Phone Link background bridge': 'Microsoft Windows Bağlantısı arka plan köprüsü',
    'Pixel showcase tutorials and notifications': 'Pixel ipuçları ve tanıtım bildirim servisi',
    'Google Feedback crash reporter': 'Google geri bildirim ve çökme raporlayıcısı',
    'Crash log submission agent': 'Hata günlüğü ve geri bildirim gönderim servisi',
    'Device Health Services battery diagnostics': 'Device Health Services pil tanı telemetrisi',
    'Battery usage diagnostics telemetry': 'Pil kullanımı ve tanı telemetrisi',
    'Background telemetry and logging service': 'Arka plan telemetri ve günlük kayıt servisi',
  };

  return descMap[desc] || desc;
}
