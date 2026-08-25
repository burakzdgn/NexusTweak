import React from 'react';
import { Settings, Shield, Info, ExternalLink } from 'lucide-react';
import { AdbConfigCard } from './AdbConfigCard';
import { WifiAdbPairing } from './WifiAdbPairing';
import { MockModeSelector } from './MockModeSelector';
import { Card } from '../ui/Card';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Settings & Environment Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage ADB connection layers, simulation profiles, and platform binaries.
        </p>
      </div>

      {/* Mock Hardware Presets */}
      <MockModeSelector />

      {/* ADB Binary Directory */}
      <AdbConfigCard />

      {/* Wireless Wi-Fi Pairing */}
      <WifiAdbPairing />

      {/* Security & System Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Security & Whitelist Architecture</h3>
            <p className="text-xs text-slate-400">
              NexusTweak strictly blocks accidental removal of critical core subsystems.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">Pre-Action Snapshots</span>
            <p className="text-slate-400 mt-1">
              Automatic state preservation before every tweak or debloat batch.
            </p>
          </div>

          <div className="p-3 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">User 0 Isolation</span>
            <p className="text-slate-400 mt-1">
              Packages are uninstalled via <code className="text-cyan-300">--user 0</code> preserving original ROM partitions.
            </p>
          </div>

          <div className="p-3 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">1-Click Full Rollback</span>
            <p className="text-slate-400 mt-1">
              Restore previous settings and re-enable packages with a single click.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
