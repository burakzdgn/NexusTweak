import React from 'react';
import { Sparkles, Smartphone, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useDeviceStore } from '../../stores/useDeviceStore';

export const MockModeSelector: React.FC = () => {
  const { activeSerial, selectDevice } = useDeviceStore();

  const presets = [
    {
      id: 'MOCK_SAMSUNG_S24U',
      name: 'Samsung Galaxy S24 Ultra',
      details: 'One UI 6.1.1 • Snapdragon 8 Gen 3 • 120Hz LTPO',
      oem: 'Samsung',
    },
    {
      id: 'MOCK_XIAOMI_14PRO',
      name: 'Xiaomi 14 Pro',
      details: 'HyperOS 1.0 • Snapdragon 8 Gen 3 • 120Hz 2K',
      oem: 'Xiaomi',
    },
    {
      id: 'MOCK_PIXEL_8PRO',
      name: 'Google Pixel 8 Pro',
      details: 'Android 14 QPR3 • Google Tensor G3 • 120Hz Actua',
      oem: 'Google',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Hardware Simulation Mode Presets</h3>
          <p className="text-xs text-slate-400">
            Switch simulated OEM device profile to test manufacturer-specific tweaks and bloatware.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((p) => {
          const isSelected = activeSerial === p.id;

          return (
            <button
              key={p.id}
              onClick={() => selectDevice(p.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500/50 shadow-glowPurple'
                  : 'bg-[#121524] border-[#202538] hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 p-1 rounded-full bg-purple-500 text-white">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <Badge variant="purple" size="sm">
                  {p.oem}
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">{p.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{p.details}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
