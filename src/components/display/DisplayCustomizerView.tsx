import React from 'react';
import {
  Monitor,
  Gauge,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  Tablet,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDisplayStore } from '../../stores/useDisplayStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerBanner } from '../legal/DisclaimerBanner';

export const DisplayCustomizerView: React.FC = () => {
  const {
    resolutionPresets,
    densityPresets,
    customWidth,
    customHeight,
    customDensity,
    setCustomWidth,
    setCustomHeight,
    setCustomDensity,
    applyResolution,
    resetResolution,
    applyDensity,
    resetDensity,
    isApplying,
  } = useDisplayStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const t = useLanguageStore((s) => s.t);

  const currentW = activeDevice?.display.width || 1080;
  const currentH = activeDevice?.display.height || 2400;
  const currentDpi = activeDevice?.display.density_dpi || 440;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          {t.display_tuning_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.display_tuning_subtitle} (
          <span className="text-cyan-300 font-semibold">
            {activeDevice?.model || 'Android'}
          </span>
          )
        </p>
      </div>

      {/* Current Hardware State Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-[#121525] to-[#0c0e18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400">Current Resolution</h4>
                <p className="text-lg font-bold font-mono text-white">
                  {currentW} × {currentH} px
                </p>
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase">
              Live
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-[#121525] to-[#0c0e18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400">Current Pixel Density</h4>
                <p className="text-lg font-bold font-mono text-white">
                  {currentDpi} DPI
                </p>
              </div>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">
              Live
            </span>
          </div>
        </Card>
      </div>

      {/* Resolution Tuning Section (wm size) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.resolution_label}</h3>
              <p className="text-xs text-slate-400">
                Modify display render resolution to reduce GPU power draw
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetResolution}
            isLoading={isApplying}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {t.reset_native_res}
          </Button>
        </div>

        {/* Quick Resolution Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {resolutionPresets.map((p) => {
            const isMatch = currentW === p.width && currentH === p.height;
            return (
              <button
                key={p.label}
                onClick={() => applyResolution(p.width, p.height)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isMatch
                    ? 'bg-cyan-500/15 border-cyan-500/40 shadow-sm'
                    : 'bg-[#121524] border-[#202538] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.label}</span>
                  {isMatch && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Width x Height */}
        <div className="p-4 bg-[#0e111d] rounded-xl border border-[#202538] flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Width (px)
            </label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#141724] border border-[#202538] rounded-lg text-xs text-white font-mono"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Height (px)
            </label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#141724] border border-[#202538] rounded-lg text-xs text-white font-mono"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => applyResolution()}
            isLoading={isApplying}
            className="w-full sm:w-auto"
          >
            {t.custom_res_btn}
          </Button>
        </div>
      </Card>

      {/* Density Tuning Section (wm density) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.density_label}</h3>
              <p className="text-xs text-slate-400">
                Scale UI elements or force dual-column tablet layouts
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetDensity}
            isLoading={isApplying}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {t.reset_native_density}
          </Button>
        </div>

        {/* Quick Density Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {densityPresets.map((p) => {
            const isMatch = currentDpi === p.density;
            return (
              <button
                key={p.label}
                onClick={() => applyDensity(p.density)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isMatch
                    ? 'bg-purple-500/15 border-purple-500/40 shadow-sm'
                    : 'bg-[#121524] border-[#202538] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {p.label} ({p.density} DPI)
                  </span>
                  {isMatch && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Density Input */}
        <div className="p-4 bg-[#0e111d] rounded-xl border border-[#202538] flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom DPI Value (e.g. 320 to 560)
            </label>
            <input
              type="number"
              value={customDensity}
              onChange={(e) => setCustomDensity(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#141724] border border-[#202538] rounded-lg text-xs text-white font-mono"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => applyDensity()}
            isLoading={isApplying}
            className="w-full sm:w-auto"
          >
            {t.custom_density_btn}
          </Button>
        </div>
      </Card>
    </div>
  );
};
