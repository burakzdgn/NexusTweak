export function translateRecommendation(rec: string, lang: 'tr' | 'en'): string {
  if (lang === 'en') return rec;

  // Animation tweaks
  if (rec.includes('Speed up UI animations')) {
    return 'Arayüz animasyonlarını 0.5x yaparak sistem tepki süresini hızlandırın';
  }

  // Refresh rate (e.g. "Force 90Hz display refresh rate to eliminate frame drops")
  const hzMatch = rec.match(/Force\s+(\d+)Hz/i);
  if (hzMatch) {
    return `Kare düşüşlerini önlemek ve akıcı deneyim için ${hzMatch[1]}Hz ekran yenileme hızını sabitleyin`;
  }

  // Private DNS
  if (rec.includes('AdGuard or Cloudflare Private DNS') || rec.includes('Private DNS')) {
    return 'Reklam ve izleyicileri engellemek için AdGuard veya Cloudflare Şifreli DNS açın';
  }

  // Doze battery
  if (rec.includes('Aggressive Doze') || rec.includes('standby battery')) {
    return 'Bekleme süresinde pil tasarrufu için Agresif Doze derin uyku modunu etkinleştirin';
  }

  // Wi-Fi Scan Throttling
  if (rec.includes('Wi-Fi background scan throttling') || rec.includes('Wi-Fi scan throttling')) {
    return 'Gereksiz ağ aramalarını durdurup pil ömrünü artırmak için Wi-Fi Tarama Kısıtlamasını kapatın';
  }

  // UI Blur (for 4GB RAM)
  if (rec.includes('UI blur') || rec.includes('blur effects')) {
    return 'GPU ve RAM belleği rahatlatmak için gerçek zamanlı UI bulanıklıklarını kapatın';
  }

  // Xiaomi MSA
  if (rec.includes('Xiaomi MSA') || rec.includes('MSA ad daemon')) {
    return 'Xiaomi MSA reklam motorunu ve analitik servislerini devre dışı bırakın';
  }

  // Xiaomi Joyose
  if (rec.includes('Joyose')) {
    return 'Oyunlarda FPS düşüşlerini önlemek için Joyose termal kısıtlamasını durdurun';
  }

  // Xiaomi Carousel
  if (rec.includes('Wallpaper Carousel')) {
    return 'Kilit ekranı sponsorlu haber/reklam akışını (Wallpaper Carousel) kapatın';
  }

  // Samsung GOS
  if (rec.includes('Samsung GOS') || rec.includes('GOS throttling')) {
    return 'Oyunlarda performans kısıtlamasını kaldırmak için Samsung GOS servisini durdurun';
  }

  // Samsung Bixby
  if (rec.includes('Samsung Bixby') || rec.includes('Bixby background')) {
    return 'Kullanılmayan Samsung Bixby arka plan servislerini devre dışı bırakın';
  }

  // Generic debloat count
  const debloatMatch = rec.match(/Debloat\s+(\d+)\s+unnecessary/i);
  if (debloatMatch) {
    return `${debloatMatch[1]} adet gereksiz OEM arka plan paketini temizleyin (Debloat)`;
  }

  return rec;
}
