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
    isMockMode,
    error,
    fetchDevices,
    selectDevice,
    refreshActiveDevice,
    setMockMode,
  } = useDeviceStore();

  const { fetchRulesForActiveDevice } = useTweaksStore();
  const { fetchPackages } = useDebloatStore();

  // Initial device polling
  useEffect(() => {
    fetchDevices();
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
    isMockMode,
    error,
    fetchDevices,
    selectDevice,
    refreshActiveDevice,
    setMockMode,
  };
}
