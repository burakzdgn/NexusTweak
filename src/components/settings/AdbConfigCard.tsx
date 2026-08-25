import React, { useState } from 'react';
import { Settings, Folder, Check, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLogStore } from '../../stores/useLogStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AdbBridge } from '../../services/adbBridge';

export const AdbConfigCard: React.FC = () => {
  const [customPath, setCustomPath] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const addLog = useLogStore((s) => s.addLog);
  const { downloadAndInstallAdb, isInstallingAdb, isAdbAvailable } = useDeviceStore();
  const t = useLanguageStore((s) => s.t);

  const handleSave = async () => {
    setIsSaved(true);
    try {
      await AdbBridge.setCustomAdbPath(customPath);
      addLog('info', 'ADB binary path configured', customPath || 'System Default (PATH)');
    } catch (e) {
      addLog('error', 'Failed to save ADB path', String(e));
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t.adb_engine_path}</h3>
            <p className="text-xs text-slate-400">
              {t.adb_engine_desc}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadAndInstallAdb()}
          isLoading={isInstallingAdb}
          leftIcon={<Download className="w-4 h-4 text-purple-400" />}
          className="text-xs shrink-0"
        >
          {t.download_adb_btn}
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t.custom_adb_path_label}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="C:\platform-tools\adb.exe (Default: system PATH or binaries/platform-tools)"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
            <Button
              variant={isSaved ? 'success' : 'primary'}
              size="sm"
              onClick={handleSave}
              leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}
            >
              {isSaved ? t.saved_badge : t.save_path_btn}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-[#121524] rounded-xl border border-[#202538] text-[11px] text-slate-400 space-y-1">
          <p>• Detection order: Custom Path → binaries/platform-tools/adb.exe → ANDROID_HOME → PATH</p>
          <p>• Supported platforms: Windows (adb.exe), macOS, Linux</p>
        </div>
      </div>
    </Card>
  );
};
