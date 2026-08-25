import React from 'react';
import { RotateCw, ShieldAlert, Camera, Layers } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLogStore } from '../../stores/useLogStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AdbBridge } from '../../services/adbBridge';

export const QuickActionGrid: React.FC = () => {
  const activeSerial = useDeviceStore((s) => s.activeSerial);
  const addLog = useLogStore((s) => s.addLog);
  const t = useLanguageStore((s) => s.t);

  const handleReboot = async (mode?: string) => {
    if (!activeSerial) return;
    try {
      const res = await AdbBridge.reboot(activeSerial, mode);
      addLog('info', `Reboot command sent: ${mode || 'normal'}`, res.stdout);
    } catch (err: unknown) {
      addLog('error', 'Reboot failed', String(err));
    }
  };

  const handleScreenshot = async () => {
    if (!activeSerial) return;
    try {
      addLog('info', 'Taking device screenshot...', 'Capturing framebuffer via ADB screencap');
      await AdbBridge.runCustomCommand(activeSerial, 'screencap -p /sdcard/nexus_shot.png');
      addLog('success', 'Screenshot captured', 'Saved to /sdcard/nexus_shot.png');
    } catch (err: unknown) {
      addLog('error', 'Screenshot failed', String(err));
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">{t.direct_device_controls}</h3>
        <span className="text-[11px] text-slate-400">{t.hardware_boot_mgmt}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleReboot()}
          leftIcon={<RotateCw className="w-4 h-4 text-cyan-400" />}
          className="justify-start py-3"
        >
          {t.reboot_device}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleReboot('recovery')}
          leftIcon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
          className="justify-start py-3"
        >
          {t.reboot_recovery}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleReboot('bootloader')}
          leftIcon={<Layers className="w-4 h-4 text-purple-400" />}
          className="justify-start py-3"
        >
          {t.reboot_bootloader}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleScreenshot}
          leftIcon={<Camera className="w-4 h-4 text-emerald-400" />}
          className="justify-start py-3"
        >
          {t.capture_screen}
        </Button>
      </div>
    </Card>
  );
};
