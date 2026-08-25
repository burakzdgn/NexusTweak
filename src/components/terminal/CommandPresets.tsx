import React from 'react';
import { Terminal, Play } from 'lucide-react';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface CommandPresetsProps {
  onSelectCommand: (cmd: string) => void;
}

export const CommandPresets: React.FC<CommandPresetsProps> = ({ onSelectCommand }) => {
  const t = useLanguageStore((s) => s.t);

  const presets = [
    { label: 'Check Battery', cmd: 'dumpsys battery' },
    { label: 'Screen Resolution', cmd: 'wm size' },
    { label: 'Screen Density', cmd: 'wm density' },
    { label: 'List Disabled Packages', cmd: 'pm list packages -d' },
    { label: 'List Third Party Apps', cmd: 'pm list packages -3' },
    { label: 'Global Animation Scales', cmd: 'settings get global window_animation_scale' },
    { label: 'Display Refresh Rates', cmd: 'dumpsys display | grep -i refresh' },
    { label: 'Device CPU Architecture', cmd: 'getprop ro.product.cpu.abi' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        {t.quick_presets}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => (
          <button
            key={p.cmd}
            onClick={() => onSelectCommand(p.cmd)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#121524] border border-[#202538] hover:border-cyan-500/40 text-left text-xs text-slate-300 hover:text-white transition-all group"
          >
            <span className="font-medium truncate">{p.label}</span>
            <Play className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
