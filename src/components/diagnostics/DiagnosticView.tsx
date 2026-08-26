import React, { useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Layers,
  MemoryStick,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useDiagnosticStore } from '../../stores/useDiagnosticStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const DiagnosticView: React.FC = () => {
  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const {
    report,
    isLoading,
    isFixing,
    error,
    selectedPackageNames,
    rebootEnabled,
    lastFixResult,
    runDiagnostics,
    togglePackageSelection,
    selectAllPackages,
    clearPackageSelection,
    setRebootEnabled,
    executeFixes,
  } = useDiagnosticStore();

  const lang = useLanguageStore((s) => s.language);

  useEffect(() => {
    if (activeDevice && !report && !isLoading) {
      runDiagnostics();
    }
  }, [activeDevice?.serial]);

  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
          <Smartphone className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">
          {lang === 'tr' ? 'Bağlı Cihaz Bulunamadı' : 'No Connected Device'}
        </h3>
        <p className="text-sm text-slate-400 max-w-md">
          {lang === 'tr'
            ? 'Derin sistem performansı ve darboğaz analizi yapmak için lütfen bir Android cihaz bağlayın.'
            : 'Please connect an Android device to perform deep system performance and bottleneck diagnostics.'}
        </p>
      </div>
    );
  }

  const criticalIssuesCount =
    report?.detected_issues.filter((i) => i.severity === 'critical').length || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090a0f] p-6 space-y-6 select-none custom-scrollbar">
      {/* Top Header & Trigger Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {lang === 'tr' ? 'Akıllı Cihaz Teşhis Raporu' : 'Smart Device Diagnostics'}
              </h2>
              {report && (
                <span
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
                    criticalIssuesCount > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  )}
                >
                  {criticalIssuesCount > 0
                    ? lang === 'tr'
                      ? `${criticalIssuesCount} Kritik Darboğaz`
                      : `${criticalIssuesCount} Critical Issues`
                    : lang === 'tr'
                    ? 'Sistem Sağlıklı'
                    : 'Optimal Health'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'tr'
                ? 'İşlemci yük kuyruğu, uptime, ZRAM bellek sıkışması ve arka plan telemetri tespiti'
                : 'Real-time CPU load queue, uptime fragmentation, ZRAM pressure and bloatware detection'}
            </p>
          </div>
        </div>

        <button
          onClick={() => runDiagnostics()}
          disabled={isLoading || isFixing}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          <span>
            {isLoading
              ? lang === 'tr'
                ? 'Analiz Ediliyor...'
                : 'Diagnosing...'
              : lang === 'tr'
              ? 'Yeniden Analiz Et'
              : 'Re-Analyze Device'}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !report && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cyan-400">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-200">
              {lang === 'tr'
                ? 'Cihazın Bellek ve İşlemci Kuyrukları Taranıyor...'
                : 'Scanning CPU load, uptime, and memory queues...'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              /proc/loadavg, /proc/uptime, /proc/meminfo ve dumpsys cpuinfo analiz ediliyor
            </p>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* 1. Device Hardware Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#12141c]/80 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'tr' ? 'Cihaz & Model' : 'Device & Model'}
                </p>
                <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                  {report.device_name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {report.android_version}
                </p>
              </div>
            </div>

            <div className="bg-[#12141c]/80 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'tr' ? 'İşlemci (SoC)' : 'Processor (SoC)'}
                </p>
                <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                  {report.soc}
                </p>
                <p className="text-[11px] text-slate-400">
                  {report.cpu_core_count} {lang === 'tr' ? 'Çekirdek' : 'Cores'}
                </p>
              </div>
            </div>

            <div className="bg-[#12141c]/80 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                <MemoryStick className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'tr' ? 'Fiziksel RAM' : 'Physical RAM'}
                </p>
                <p className="text-sm font-semibold text-white">
                  {(report.total_ram_mb / 1024).toFixed(1)} GB LPDDR
                </p>
                <p className="text-[11px] text-amber-400 font-medium">
                  {lang === 'tr' ? `Boşta: ~${report.free_ram_mb} MB` : `Free: ~${report.free_ram_mb} MB`}
                </p>
              </div>
            </div>

            <div className="bg-[#12141c]/80 border border-slate-800 rounded-xl p-4 flex items-center space-x-3.5">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'tr' ? 'Depolama Alanı' : 'Storage Space'}
                </p>
                <p className="text-sm font-semibold text-white">
                  {report.storage_free_gb} GB {lang === 'tr' ? 'Boş' : 'Free'}
                </p>
                <p className="text-[11px] text-slate-400">
                  %{report.storage_used_percent} {lang === 'tr' ? 'Dolu' : 'Used'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Key Diagnostic Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1: Load Average */}
            <div
              className={clsx(
                'rounded-2xl p-5 border shadow-lg transition-all',
                report.is_load_critical
                  ? 'bg-gradient-to-b from-rose-950/20 to-[#12141c] border-rose-500/30'
                  : 'bg-[#12141c]/80 border-slate-800'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={clsx(
                      'p-2 rounded-lg',
                      report.is_load_critical
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    )}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'tr' ? 'İşlemci Yük Kuyruğu (Load Avg)' : 'CPU Load Average'}
                  </h4>
                </div>
                <span
                  className={clsx(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    report.is_load_critical
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  )}
                >
                  {report.is_load_critical
                    ? lang === 'tr'
                      ? 'Yüksek Yük'
                      : 'High Overload'
                    : lang === 'tr'
                    ? 'Normal'
                    : 'Normal'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {report.load_avg_1m.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    5m: {report.load_avg_5m.toFixed(2)} | 15m: {report.load_avg_15m.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      report.is_load_critical ? 'bg-rose-500' : 'bg-emerald-500'
                    )}
                    style={{
                      width: `${Math.min((report.load_avg_1m / 16) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {lang === 'tr'
                    ? `Normalde boşta 1.0 - 2.5 arası beklenir. Şu an ortalama ${report.load_avg_1m.toFixed(1)} iş parçacığı sırada bekliyor.`
                    : `Normal idle is 1.0 - 2.5. Currently ~${report.load_avg_1m.toFixed(1)} threads waiting.`}
                </p>
              </div>
            </div>

            {/* Metric 2: Uptime & system_server */}
            <div
              className={clsx(
                'rounded-2xl p-5 border shadow-lg transition-all',
                report.uptime_seconds > 400000
                  ? 'bg-gradient-to-b from-amber-950/20 to-[#12141c] border-amber-500/30'
                  : 'bg-[#12141c]/80 border-slate-800'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={clsx(
                      'p-2 rounded-lg',
                      report.uptime_seconds > 400000
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    )}
                  >
                    <Timer className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'tr' ? 'Kesintisiz Çalışma (Uptime)' : 'Uptime & System Server'}
                  </h4>
                </div>
                <span
                  className={clsx(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    report.uptime_seconds > 400000
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  )}
                >
                  {report.uptime_seconds > 400000
                    ? lang === 'tr'
                      ? 'Yeniden Başlatma Gerekli'
                      : 'Reboot Advised'
                    : lang === 'tr'
                    ? 'İyi Durumda'
                    : 'Optimal'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="text-xl font-black text-white tracking-tight truncate">
                  {report.uptime_formatted}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  system_server:{' '}
                  <span className="text-cyan-400 font-mono">
                    {report.system_server_cpu_time || 'Aktif'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {lang === 'tr'
                    ? 'Uzun süre açık kalan cihazlarda IPC/Binder kanalları ve bellek tamponları şişerek arayüz takılmalarına yol açar.'
                    : 'Long uptime causes IPC/Binder fragmentation and memory leak micro-stutters.'}
                </p>
              </div>
            </div>

            {/* Metric 3: ZRAM & Swap Pressure */}
            <div
              className={clsx(
                'rounded-2xl p-5 border shadow-lg transition-all',
                report.is_ram_critical
                  ? 'bg-gradient-to-b from-purple-950/20 to-[#12141c] border-purple-500/30'
                  : 'bg-[#12141c]/80 border-slate-800'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={clsx(
                      'p-2 rounded-lg',
                      report.is_ram_critical
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    )}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'tr' ? 'ZRAM / Sanal Bellek Baskısı' : 'ZRAM / Swap Pressure'}
                  </h4>
                </div>
                <span
                  className={clsx(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    report.is_ram_critical
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  )}
                >
                  {report.is_ram_critical
                    ? lang === 'tr'
                      ? 'Sıkıştırma Yüksek'
                      : 'High Swap Thrash'
                    : lang === 'tr'
                    ? 'Dengeli'
                    : 'Balanced'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-black text-white tracking-tight">
                    {(report.zram_used_mb / 1024).toFixed(2)} GB Swap
                  </span>
                  <span className="text-xs text-purple-400 font-mono">
                    / {(report.zram_total_mb / 1024).toFixed(1)} GB Max
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{
                      width: `${Math.min(
                        (report.zram_used_mb / Math.max(report.zram_total_mb, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {lang === 'tr'
                    ? `Kullanılabilir fiziksel RAM ~${report.available_ram_mb} MB. Zayıf çekirdekler RAM'i sürekli sıkıştırıp açarken yorulur.`
                    : `Available RAM ~${report.available_ram_mb} MB. CPU spends time decompressing ZRAM pages.`}
                </p>
              </div>
            </div>
          </div>

          {/* 2.5 Quick Pro-Tip for High Load Average */}
          {report.is_load_critical && (
            <div className="p-4.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#12141c] to-indigo-950/30 border border-amber-500/40 shadow-lg flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-bold text-sm text-white flex items-center space-x-2">
                  <span>
                    {lang === 'tr'
                      ? '⚡ Yüksek İşlemci Yükü (Load Average) Neden Hemen Düşmez ve Nasıl Çözülür?'
                      : '⚡ Why Does Load Average Stay High & How to Fix It?'}
                  </span>
                </p>
                <p className="text-slate-300">
                  {lang === 'tr'
                    ? 'Android/Linux sistemlerinde Load Average yalnızca CPU kullanımını değil; yavaş depolamadan (eMMC) dosya bekleyen (I/O Wait) iş parçacıklarını da sayar.'
                    : 'On Android/Linux, Load Average counts both active CPU threads and I/O Wait threads blocked on storage.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-slate-300">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <strong className="text-amber-300">1. Bellek Uzantısı (Sanal RAM):</strong>{' '}
                    {lang === 'tr'
                      ? 'Telefonunuzun Ayarlar > Ek Ayarlar > Bellek Uzantısı menüsüne giderek Sanal RAM\'i KAPATIN. eMMC yongasının sürekli swap yazmasını engelleyerek yükü anında yarı yarıya düşürür.'
                      : 'Go to Settings > Additional Settings > Memory Extension and turn it OFF to stop swap I/O thrashing.'}
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <strong className="text-cyan-300">2. Yeniden Başlatma Sonrası 5 Dakika:</strong>{' '}
                    {lang === 'tr'
                      ? 'Cihaz yeniden açıldığında Google Play ve Medya Tarayıcı ilk 3-5 dakika disk taraması yapar; yükün oturması için birkaç dakika bekleyin.'
                      : 'MediaScanner and Play Store scan storage for 3-5 mins right after boot before stabilizing.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. "🚨 Neden Yavaş? (Tespit Edilen Temel Sorunlar)" Section */}
          <div className="bg-[#12141c]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'tr'
                    ? '🚨 Neden Yavaş? (Tespit Edilen Temel Sorunlar)'
                    : '🚨 Why is it Slow? (Identified Bottlenecks)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'tr'
                    ? 'Cihazınızda donanım ve yazılım katmanında tespit edilen gecikme nedenleri:'
                    : 'Detailed root causes slowing down your UI and draining memory:'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {report.detected_issues.map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={clsx(
                    'rounded-xl p-4.5 border transition-all',
                    issue.severity === 'critical'
                      ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                      : issue.severity === 'warning'
                      ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                      : 'bg-cyan-950/15 border-cyan-500/30 hover:border-cyan-500/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <span
                        className={clsx(
                          'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5',
                          issue.severity === 'critical'
                            ? 'bg-rose-500/30 text-rose-300'
                            : issue.severity === 'warning'
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-cyan-500/30 text-cyan-300'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {issue.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {issue.description}
                        </p>
                        <div className="mt-2.5 text-[11px] font-mono bg-black/30 px-3 py-1.5 rounded-lg text-slate-400 border border-white/5">
                          💡 <strong className="text-slate-300">Tavsiye:</strong>{' '}
                          {issue.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 4. Active Bloatware & Telemetry Table */}
          {report.detected_bloat_processes.length > 0 && (
            <div className="bg-[#12141c]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>
                      {lang === 'tr'
                        ? 'Arka Planda Çalışan Şişkinlik & Telemetri Servisleri'
                        : 'Background Telemetry & Bloatware Services'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {report.detected_bloat_processes.length} {lang === 'tr' ? 'Adet' : 'Items'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'tr'
                      ? 'Arka planda sürekli CPU ve RAM tüketen seçili servisleri tek tıkla devre dışı bırakabilirsiniz.'
                      : 'Select packages you want to safely disable to reclaim system memory and processor queue.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllPackages}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 cursor-pointer"
                  >
                    {lang === 'tr' ? 'Tümünü Seç' : 'Select All'}
                  </button>
                  <button
                    onClick={clearPackageSelection}
                    className="text-xs font-medium text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer"
                  >
                    {lang === 'tr' ? 'Temizle' : 'Clear'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {report.detected_bloat_processes.map((proc) => {
                  const isChecked = selectedPackageNames.has(proc.package_name);
                  return (
                    <div
                      key={proc.package_name}
                      role="button"
                      tabIndex={0}
                      onClick={() => togglePackageSelection(proc.package_name)}
                      className={clsx(
                        'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                        isChecked
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-inner'
                          : 'bg-[#181b26]/60 border-slate-800/80 hover:border-slate-700'
                      )}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className={clsx(
                            'w-4.5 h-4.5 rounded flex items-center justify-center border transition-all shrink-0',
                            isChecked
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent'
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {proc.app_name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate">
                            {proc.package_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {proc.description}
                          </p>
                        </div>
                      </div>

                      {proc.cpu_time_info && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20 whitespace-nowrap shrink-0">
                          {proc.cpu_time_info}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. 🛠️ 1-Click Automated Resolution Panel */}
          <div className="bg-gradient-to-r from-indigo-950/50 via-[#12141c] to-cyan-950/50 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'tr'
                      ? '🛠️ Cihazı Rahatlat & Sorunları Çöz'
                      : '🛠️ Automated 1-Click System Resolution'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'tr'
                      ? 'Sistem önce otomatik bir güvenlik yedeği (snapshot) alacak, ardından seçili optimizasyonları güvenle uygulayacaktır.'
                      : 'NexusTweak takes a full safety backup snapshot first, then applies debloat and memory optimizations.'}
                  </p>
                </div>
              </div>

              {/* Safety badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'tr' ? 'Otomatik Snapshot Garantili' : 'Safety Snapshot Guaranteed'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setRebootEnabled(!rebootEnabled)}
                className={clsx(
                  'flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                  rebootEnabled
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-inner'
                    : 'bg-[#181b26]/50 border-slate-800 hover:border-slate-700'
                )}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0',
                    rebootEnabled
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {lang === 'tr'
                        ? 'İşlemden Sonra Cihazı Yeniden Başlat'
                        : 'Reboot Device After Optimization'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'tr'
                      ? `${report.uptime_formatted} süren bellek şişmesini ve IPC tıkanıklığını sıfırlar.`
                      : 'Resets system_server buffers and fragmentation after long uptime.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181b26]/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {selectedPackageNames.size} {lang === 'tr' ? 'Şişkinlik Paketi Kapatılacak' : 'Bloatware Packages to Disable'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'tr' ? 'İstediğiniz zaman tek tıkla geri yüklenebilir.' : '100% reversible at any time.'}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={executeFixes}
                disabled={isFixing || (selectedPackageNames.size === 0 && !rebootEnabled)}
                className="flex items-center space-x-3 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>
                      {lang === 'tr'
                        ? 'Snapshot Alınıyor & Çözüm Uygulanıyor...'
                        : 'Taking Snapshot & Resolving...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>
                      {lang === 'tr'
                        ? 'Otomatik Snapshot Alarak Cihazı Rahatlat'
                        : 'Take Snapshot & Resolve Bottlenecks'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
