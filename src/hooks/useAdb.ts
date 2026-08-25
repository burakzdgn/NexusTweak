import { useEffect } from 'react';
import { useDeviceStore } from '../stores/useDeviceStore';
import { useTweaksStore } from '../stores/useTweaksStore';
import { useDebloatStore } from '../stores/useDebloatStore';

export function useAdb() {
  const {
    devices,
    activeSerial,
    activeDevice,
    healthScore,
    isLoading,
    isScanning,
    isAdbAvailable,
    isInstallingAdb,
    error,
    fetchDevices,
    selectDevice,
    refreshActiveDevice,
    downloadAndInstallAdb,
  } = useDeviceStore();

  const { fetchRulesForActiveDevice } = useTweaksStore();
  const { fetchPackages } = useDebloatStore();

  // Initial device polling and auto-discovery background watcher
  useEffect(() => {
    // 1. Initial immediate scan on launch
    fetchDevices();

    // 2. Background polling: automatically detect when a device is plugged in
    const interval = setInterval(() => {
      const state = useDeviceStore.getState();
      // If no active device and not currently scanning, check for newly connected devices
      if (!state.activeDevice && !state.isLoading && !state.isScanning) {
        state.fetchDevices();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchDevices]);

  // When active device changes, refresh tweaks and debloat catalog
  useEffect(() => {
    if (activeSerial) {
      fetchRulesForActiveDevice();
      fetchPackages();
    }
  }, [activeSerial, fetchRulesForActiveDevice, fetchPackages]);

  return {
    devices,
    activeSerial,
    activeDevice,
    healthScore,
    isLoading,
    isScanning,
    isAdbAvailable,
    isInstallingAdb,
    error,
    fetchDevices,
    selectDevice,
    refreshActiveDevice,
    downloadAndInstallAdb,
  };
}
