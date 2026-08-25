import React from 'react';
import {
  Smartphone,
  RefreshCw,
  Globe,
  Terminal,
} from 'lucide-react';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLogStore } from '../../stores/useLogStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const {
    devices,
    activeSerial,
    activeDevice,
    isScanning,
    fetchDevices,
    selectDevice,
  } = useDeviceStore();

  const { language, setLanguage, t } = useLanguageStore();
  const toggleTerminal = useLogStore((s) => s.toggleTerminal);
  const isTerminalOpen = useLogStore((s) => s.isTerminalOpen);

  return (
    <header className="h-16 bg-[#0c0e17]/90 backdrop-blur-md border-b border-[#1a1e2f] px-6 flex items-center justify-between select-none">
      {/* Device Selector Dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#131625] border border-[#202538]">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <select
              value={activeSerial || ''}
              onChange={(e) => selectDevice(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer pr-4"
            >
              {devices.length === 0 ? (
                <option value="" disabled className="bg-[#11131f] text-slate-400">
                  {t.no_device_attached}
                </option>
              ) : (
                devices.map((d) => (
                  <option key={d.serial} value={d.serial} className="bg-[#11131f] text-slate-200">
                    {d.model} ({d.serial})
                  </option>
                ))
              )}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchDevices()}
            isLoading={isScanning}
            className="ml-2 text-slate-400 hover:text-cyan-400"
            title={t.refresh_devices}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection status tag */}
        {activeDevice ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">
              {activeDevice.serial.includes(':') ? t.connected_wifi : t.connected_usb}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{t.scanning_adb}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Language Selector & Terminal Toggle */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-[#131625] p-1 rounded-xl border border-[#202538]">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setLanguage('tr')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
              language === 'tr'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
              language === 'en'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        {/* Toggle Terminal Drawer */}
        <Button
          variant={isTerminalOpen ? 'primary' : 'outline'}
          size="sm"
          onClick={toggleTerminal}
          leftIcon={<Terminal className="w-3.5 h-3.5" />}
        >
          {t.terminal_console_btn}
        </Button>
      </div>
    </header>
  );
};
