import React, { useEffect } from 'react';
import {
  Cast,
  Play,
  Square,
  Moon,
  Video,
  Eye,
  VolumeX,
  Lock,
  Layers,
  Download,
  CheckCircle2,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { useMirrorStore } from '../../stores/useMirrorStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerBanner } from '../legal/DisclaimerBanner';

export const ScreenMirrorView: React.FC = () => {
  const {
    isMirroring,
    isScrcpyAvailable,
    isInstallingScrcpy,
    options,
    setOption,
    checkScrcpyInstalled,
    downloadAndInstallScrcpy,
    startMirroring,
    stopMirroring,
  } = useMirrorStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    checkScrcpyInstalled();
  }, [checkScrcpyInstalled]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Cast className="w-5 h-5 text-cyan-400" />
            {t.mirror_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.mirror_subtitle} (
            <span className="text-cyan-300 font-semibold">
              {activeDevice?.model || 'Android'}
            </span>
            )
          </p>
        </div>

        {/* Live Status Badge */}
        {isMirroring && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {t.mirror_active_badge}
          </div>
        )}
      </div>

      {/* scrcpy Installer Card (if not yet found or available) */}
      {!isScrcpyAvailable && (
        <Card className="p-6 border-purple-500/40 bg-gradient-to-r from-[#141527] to-[#101222]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t.scrcpy_missing_title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {t.scrcpy_missing_desc}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => downloadAndInstallScrcpy()}
              isLoading={isInstallingScrcpy}
              leftIcon={<Download className="w-4 h-4" />}
              className="shrink-0 text-xs"
            >
              {t.download_scrcpy_btn}
            </Button>
          </div>
        </Card>
      )}

      {/* Launcher & Quick Start Hero */}
      <Card className="p-6 bg-gradient-to-br from-[#12162a] via-[#0d101d] to-[#090b14] border-cyan-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Zero-Latency Android Screen Stream
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Mirror your phone screen in real time with high refresh rate (up to 120 FPS),
              direct mouse gestures, clipboard synchronization, and full keyboard typing.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isMirroring ? (
              <Button
                variant="danger"
                size="md"
                onClick={stopMirroring}
                leftIcon={<Square className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-lg"
              >
                {t.stop_mirror_btn}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={startMirroring}
                leftIcon={<Play className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-glow font-bold"
              >
                {t.start_mirror_btn}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Mirroring Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Screen-Off Mode */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_turn_screen_off}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.opt_turn_screen_off_desc}
              </p>
            </div>
          </div>
          <Switch
            checked={options.turn_screen_off}
            onChange={(v) => setOption('turn_screen_off', v)}
          />
        </Card>

        {/* Record to MP4 */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 mt-0.5">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_record}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.opt_record_desc}
              </p>
            </div>
          </div>
          <Switch
            checked={options.record_to_file}
            onChange={(v) => setOption('record_to_file', v)}
          />
        </Card>

        {/* Stay Awake */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_stay_awake}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.opt_stay_awake_desc}
              </p>
            </div>
          </div>
          <Switch
            checked={options.stay_awake}
            onChange={(v) => setOption('stay_awake', v)}
          />
        </Card>

        {/* Show Touches */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_show_touches}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.opt_show_touches_desc}
              </p>
            </div>
          </div>
          <Switch
            checked={options.show_touches}
            onChange={(v) => setOption('show_touches', v)}
          />
        </Card>

        {/* Always on Top */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_always_on_top}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Keeps the mirror window above other applications.
              </p>
            </div>
          </div>
          <Switch
            checked={options.always_on_top}
            onChange={(v) => setOption('always_on_top', v)}
          />
        </Card>

        {/* Mute Audio */}
        <Card className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-700/30 text-slate-300 mt-0.5">
              <VolumeX className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.opt_no_audio}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Prevents device audio from playing through computer speakers.
              </p>
            </div>
          </div>
          <Switch
            checked={options.no_audio}
            onChange={(v) => setOption('no_audio', v)}
          />
        </Card>
      </div>

      {/* Frame Rate & Bitrate Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-white">{t.fps_limit_label}</label>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {options.max_fps || 60} FPS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 120].map((fps) => (
              <button
                key={fps}
                onClick={() => setOption('max_fps', fps)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  options.max_fps === fps
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#121524] border-[#202538] text-slate-400 hover:text-white'
                }`}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-white">{t.bitrate_label}</label>
            <span className="text-xs font-mono font-bold text-purple-400">
              {options.bit_rate_mb || 8} Mbps
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[4, 8, 16, 32].map((mb) => (
              <button
                key={mb}
                onClick={() => setOption('bit_rate_mb', mb)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  options.bit_rate_mb === mb
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-[#121524] border-[#202538] text-slate-400 hover:text-white'
                }`}
              >
                {mb}M
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Open Source License & Attribution Footer */}
      <div className="p-4 rounded-2xl bg-[#0a0c14] border border-[#1b1f30] text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{t.scrcpy_license_notice}</span>
        </div>
        <span className="font-mono text-slate-600">Apache-2.0</span>
      </div>
    </div>
  );
};
