import { useMemo } from 'react';
import { useDeviceStore } from '../stores/useDeviceStore';

export function useDeviceStats() {
  const activeDevice = useDeviceStore((state) => state.activeDevice);

  const stats = useMemo(() => {
    if (!activeDevice) return null;

    const ramUsedMb = activeDevice.total_ram_mb - activeDevice.available_ram_mb;
    const ramPercentage = Math.round((ramUsedMb / activeDevice.total_ram_mb) * 100);

    const tempStatus =
      activeDevice.battery.temperature_c > 42
        ? 'critical'
        : activeDevice.battery.temperature_c > 37
        ? 'warm'
        : 'normal';

    return {
      ramUsedMb,
      ramPercentage,
      ramTotalGb: (activeDevice.total_ram_mb / 1024).toFixed(1),
      ramAvailableGb: (activeDevice.available_ram_mb / 1024).toFixed(1),
      batteryLevel: activeDevice.battery.level,
      batteryTemp: activeDevice.battery.temperature_c,
      tempStatus,
      batteryHealth: activeDevice.battery.health,
      batteryStatus: activeDevice.battery.status,
      refreshRate: activeDevice.display.refresh_rate_hz,
      resolution: `${activeDevice.display.width} × ${activeDevice.display.height}`,
      density: `${activeDevice.display.density_dpi} DPI`,
      androidRelease: activeDevice.android_version,
      securityPatch: activeDevice.security_patch,
      socPlatform: activeDevice.soc_platform,
    };
  }, [activeDevice]);

  return stats;
}
