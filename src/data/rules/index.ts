import { GENERIC_TWEAKS } from './generic';
import { SAMSUNG_TWEAKS } from './samsung';
import { XIAOMI_TWEAKS } from './xiaomi';
import { PIXEL_TWEAKS } from './pixel';
import { TweakRule } from '../../types/tweaks';
import { DeviceInfo } from '../../types/device';

export const ALL_RULES: TweakRule[] = [
  ...GENERIC_TWEAKS,
  ...SAMSUNG_TWEAKS,
  ...XIAOMI_TWEAKS,
  ...PIXEL_TWEAKS,
];

export function getApplicableRulesForDevice(device: DeviceInfo): TweakRule[] {
  const oem = device.manufacturer.toLowerCase();
  const brand = device.brand.toLowerCase();

  return ALL_RULES.filter((rule) => {
    let matchesOem = false;
    switch (rule.targetOem) {
      case 'generic':
        matchesOem = true;
        break;
      case 'samsung':
        matchesOem = oem.includes('samsung') || brand.includes('samsung');
        break;
      case 'xiaomi':
        matchesOem =
          oem.includes('xiaomi') ||
          oem.includes('redmi') ||
          oem.includes('poco') ||
          brand.includes('xiaomi');
        break;
      case 'google':
        matchesOem =
          oem.includes('google') ||
          brand.includes('google') ||
          brand.includes('pixel');
        break;
      default:
        matchesOem = false;
    }

    if (!matchesOem) return false;
    if (rule.minSdk && device.sdk_version < rule.minSdk) return false;
    if (rule.maxSdk && device.sdk_version > rule.maxSdk) return false;

    return true;
  });
}
