import React, { useState } from 'react';
import { Wifi, Link } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLogStore } from '../../stores/useLogStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AdbBridge } from '../../services/adbBridge';

export const WifiAdbPairing: React.FC = () => {
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [port, setPort] = useState('5555');
  const [isConnecting, setIsConnecting] = useState(false);
  const addLog = useLogStore((s) => s.addLog);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);
  const t = useLanguageStore((s) => s.t);

  const handleConnect = async () => {
    setIsConnecting(true);
    const target = `${ipAddress}:${port}`;
    addLog('info', `Connecting to wireless ADB at ${target}...`);

    try {
      const res = await AdbBridge.connectWifi(target);
      if (res.success) {
        addLog('success', `Connected to wireless device ${target}`, res.stdout);
        await fetchDevices();
      } else {
        addLog('error', `Failed to connect to ${target}`, res.stderr);
      }
    } catch (e) {
      addLog('error', `Wi-Fi connect failed`, String(e));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{t.wifi_pairing_title}</h3>
          <p className="text-xs text-slate-400">
            {t.wifi_pairing_desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t.device_ip}
          </label>
          <input
            type="text"
            placeholder="192.168.1.100"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="w-full px-3 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t.adb_port}
          </label>
          <input
            type="text"
            placeholder="5555"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-3 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e2338]">
        <span className="text-[11px] text-slate-400">
          {t.wifi_note}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConnect}
          isLoading={isConnecting}
          leftIcon={<Link className="w-4 h-4" />}
        >
          {t.connect_wifi_btn}
        </Button>
      </div>
    </Card>
  );
};
