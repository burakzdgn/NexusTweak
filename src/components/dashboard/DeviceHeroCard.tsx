import React from 'react';
import {
  Smartphone,
  Cpu,
  Shield,
  Layers,
  Fingerprint,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DeviceInfo } from '../../types/device';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface DeviceHeroCardProps {
  device: DeviceInfo;
}

export const DeviceHeroCard: React.FC<DeviceHeroCardProps> = ({ device }) => {
  const t = useLanguageStore((s) => s.t);

  const getOemGradient = () => {
    const oem = device.manufacturer.toLowerCase();
    if (oem.includes('samsung')) return 'from-blue-600/20 via-cyan-500/10 to-transparent';
    if (oem.includes('xiaomi') || oem.includes('redmi'))
      return 'from-orange-600/20 via-amber-500/10 to-transparent';
    if (oem.includes('google')) return 'from-emerald-600/20 via-blue-500/10 to-transparent';
    return 'from-purple-600/20 via-cyan-500/10 to-transparent';
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getOemGradient()}`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Device Brand and Model */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center shadow-xl">
              <Smartphone className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {device.model}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {device.manufacturer} • Codename: {device.device_codename} • Build:{' '}
                {device.build_id}
              </p>
            </div>
          </div>

          {/* Quick Specs Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#202538] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                Android {device.android_version}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                (API {device.sdk_version})
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#202538] flex items-center gap-2">
              <Shield
                className={`w-3.5 h-3.5 ${
                  device.selinux_enforcing ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span className="text-xs font-semibold text-slate-200">
                SELinux: {device.selinux_enforcing ? 'Enforcing' : 'Permissive'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#202538] flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-mono text-slate-300">
                {device.serial}
              </span>
            </div>
          </div>
        </div>

        {/* Deep Hardware Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2338]">
          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> {t.soc_processor}
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
              {device.soc_platform}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> {t.display_panel}
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-1">
              {device.display.width} × {device.display.height} @ {device.display.refresh_rate_hz}Hz
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {t.security_patch}
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-1">
              {device.security_patch}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.root_access}
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-1">
              {device.is_rooted ? (
                <span className="text-rose-400">{t.rooted}</span>
              ) : (
                <span className="text-emerald-400">{t.unrooted}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
