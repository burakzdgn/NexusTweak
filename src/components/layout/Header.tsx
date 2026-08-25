import React from 'react';
import {
  Smartphone,
  RefreshCw,
  Usb,
  Wifi,
  Sparkles,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLogStore } from '../../stores/useLogStore';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const {
    devices,
    activeSerial,
    activeDevice,
    isScanning,
    isMockMode,
    fetchDevices,
    selectDevice,
    setMockMode,
  } = useDeviceStore();

  const toggleTerminal = useLogStore((s) => s.toggleTerminal);
  const isTerminalOpen = useLogStore((s) => s.isTerminalOpen);

  return (
    <header className="h-16 bg-[#0c0e17]/80 backdrop-blur-md border-b border-[#1a1e2f] px-6 flex items-center justify-between select-none">
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
              {devices.length === 0 && (
                <option value="" disabled>
                  No Device Attached
                </option>
              )}
              {devices.map((d) => (
                <option key={d.serial} value={d.serial} className="bg-[#11131f] text-slate-200">
                  {d.model} ({d.serial.startsWith('MOCK_') ? 'Simulation' : d.serial})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchDevices()}
            isLoading={isScanning}
            className="ml-2 text-slate-400 hover:text-cyan-400"
            title="Refresh Devices"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection status tag */}
        {activeDevice ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">
              {activeDevice.is_mock ? 'Mock Mode' : 'Connected via USB'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Scanning for ADB...</span>
          </div>
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-4">
        {/* Mock Mode Switch */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131625] border border-[#202538]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-slate-300">Mock Mode</span>
          <Switch
            size="sm"
            checked={isMockMode}
            onChange={(checked) => setMockMode(checked)}
          />
        </div>

        {/* Toggle Terminal Button */}
        <Button
          variant={isTerminalOpen ? 'primary' : 'outline'}
          size="sm"
          onClick={toggleTerminal}
          leftIcon={<Terminal className="w-3.5 h-3.5" />}
        >
          Terminal Console
        </Button>
      </div>
    </header>
  );
};
