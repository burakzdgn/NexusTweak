export const SYSTEM_WHITELIST: Record<string, string> = {
  'android': 'Android Core Framework',
  'com.android.systemui': 'System UI, Status Bar and Navigation',
  'com.android.settings': 'System Settings Application',
  'com.google.android.gms': 'Google Play Services Runtime',
  'com.google.android.gsf': 'Google Services Framework',
  'com.android.vending': 'Google Play Store (App Licensing)',
  'com.android.phone': 'Telephony & Cellular Radio Daemon',
  'com.android.server.telecom': 'Emergency Calling Subsystem',
  'com.android.dialer': 'Default Phone Dialer',
  'com.google.android.dialer': 'Google Phone App',
  'com.android.launcher3': 'AOSP Default Home Launcher',
  'com.sec.android.app.launcher': 'Samsung One UI Home Launcher',
  'com.miui.home': 'Xiaomi HyperOS / MIUI System Launcher',
  'com.google.android.apps.nexuslauncher': 'Pixel Home Launcher',
  'com.android.keychain': 'System Cryptographic Key Storage',
  'com.android.packageinstaller': 'Android Package Installer',
  'com.google.android.packageinstaller': 'Google Package Installer',
  'com.android.permissioncontroller': 'Permissions Security Controller',
  'com.android.providers.telephony': 'SMS & APN Database Provider',
  'com.android.providers.settings': 'System Settings Storage Provider',
};

export const isSystemWhitelisted = (pkg: string): boolean => {
  if (SYSTEM_WHITELIST[pkg]) return true;
  if (pkg === 'android' || pkg.startsWith('com.android.internal.')) return true;
  return false;
};
