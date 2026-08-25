import React from 'react';
import { Settings, Shield, Globe } from 'lucide-react';
import { AdbConfigCard } from './AdbConfigCard';
import { WifiAdbPairing } from './WifiAdbPairing';
import { Card } from '../ui/Card';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t } = useLanguageStore();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          {t.settings_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.settings_subtitle}
        </p>
      </div>

      {/* Language Preference Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.language_label}</h3>
              <p className="text-xs text-slate-400">
                Uygulama arayüz dili / Application interface language
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#121524] p-1.5 rounded-xl border border-[#202538]">
            <button
              onClick={() => setLanguage('tr')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'tr'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Türkçe (TR)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>
      </Card>

      {/* ADB Binary Directory & 1-Click Installer */}
      <AdbConfigCard />

      {/* Wireless Wi-Fi Pairing */}
      <WifiAdbPairing />

      {/* Security & System Architecture Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t.security_arch_title}</h3>
            <p className="text-xs text-slate-400">
              {t.security_arch_desc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">{t.feature_snapshots}</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              {t.feature_snapshots_desc}
            </p>
          </div>

          <div className="p-3.5 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">{t.feature_isolation}</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              {t.feature_isolation_desc}
            </p>
          </div>

          <div className="p-3.5 bg-[#121524] rounded-xl border border-[#202538]">
            <span className="font-bold text-slate-200">{t.feature_rollback}</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              {t.feature_rollback_desc}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
