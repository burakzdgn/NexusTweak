import React from 'react';
import { MemoryStick, Monitor, Gauge, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { DeviceInfo } from '../../types/device';

interface MetricGaugesProps {
  device: DeviceInfo;
}

export const MetricGauges: React.FC<MetricGaugesProps> = ({ device }) => {
  const usedRamMb = device.total_ram_mb - device.available_ram_mb;
  const ramPercent = Math.round((usedRamMb / device.total_ram_mb) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* RAM Utilization */}
      <Card className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <MemoryStick className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">RAM Allocation</h4>
              <p className="text-[11px] text-slate-400">Physical LPDDR Memory</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {ramPercent}%
          </span>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${ramPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>{(usedRamMb / 1024).toFixed(1)} GB Used</span>
            <span>{(device.total_ram_mb / 1024).toFixed(1)} GB Total</span>
          </div>
        </div>
      </Card>

      {/* Dynamic Screen Refresh Rate */}
      <Card className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Refresh Rate</h4>
              <p className="text-[11px] text-slate-400">Dynamic Panel Hz</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-400">
            {device.display.refresh_rate_hz} Hz
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-1">
          {device.display.supported_refresh_rates.map((hz) => (
            <div
              key={hz}
              className={`flex-1 py-1.5 rounded-lg text-center font-mono text-xs border ${
                device.display.refresh_rate_hz === hz
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
              }`}
            >
              {hz}Hz
            </div>
          ))}
        </div>
      </Card>

      {/* Screen Density & Scale */}
      <Card className="p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Pixel Density</h4>
              <p className="text-[11px] text-slate-400">wm density / DPI Scale</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {device.display.density_dpi} DPI
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#1e2338]">
          <span className="text-xs text-slate-400">Display Dimensions</span>
          <span className="text-xs font-mono font-semibold text-slate-200">
            {device.display.width} × {device.display.height} px
          </span>
        </div>
      </Card>
    </div>
  );
};
