<div align="center">

  <img src="./public/logo.svg" alt="NexusTweak Logo" width="100" height="100" />

  # ⚡ NexusTweak
  ### Modern, Safe & High-Performance Android ADB Optimization & Management Suite
  *Modern, Güvenli ve Yüksek Performanslı Android ADB Optimizasyon ve Yönetim Aracı*

  <p align="center">
    <strong><a href="#-english">🇬🇧 English</a></strong> •
    <strong><a href="./README.tr.md">🇹🇷 Türkçe (Turkish)</a></strong>
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://v2.tauri.app/)
  [![Rust](https://img.shields.io/badge/Rust-Backend-dea584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Platform: Windows | macOS | Linux](https://img.shields.io/badge/Platform-Cross--Platform-brightgreen?style=for-the-badge)](https://github.com/burakzdgn/NexusTweak)

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-disclaimer-of-liability">Disclaimer</a> •
    <a href="#-supported-oem-presets">OEM Presets</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-safety--rollback-philosophy">Safety & Rollback</a> •
    <a href="#-third-party-attributions">Attributions</a>
  </p>

</div>

---

<a name="english"></a>
## ⚠️ Disclaimer of Liability

> [!CAUTION]
> **USE AT YOUR OWN RISK.**
> NexusTweak provides powerful low-level Android ADB commands, system property tuning, screen resolution modifications (`wm size` / `wm density`), screen mirroring, and package debloating.
> - All optimizations and debloat operations are performed solely at the user's own discretion and risk.
> - The developers and contributors of NexusTweak assume **NO RESPONSIBILITY OR LIABILITY** for any direct or indirect damage, data loss, bootloops, system instability, or voided device warranties.
> - Always maintain independent data backups and verify rollback snapshots before making extensive modifications.

---

## 📖 Overview

**NexusTweak** is an open-source, modern, and high-performance desktop application designed to diagnose, optimize, debloat, and manage Android devices via USB or Wireless (Wi-Fi) ADB.

Built with **Tauri v2 (Rust backend)** and a **React 18 + TypeScript + Tailwind CSS** interface, it delivers deep hardware telemetry, live screen mirroring & control (powered by scrcpy), 1-click optimization profiles, batch APK installation & extraction, display resolution & DPI customization, and automated rollback snapshots.

---

## ✨ Key Features

### 📱 1. Live Screen Mirroring & Control (Powered by scrcpy)
- **Zero-Latency Stream:** High frame rate display stream (up to 120 FPS) with full mouse gestures, text typing, and clipboard sync.
- **Screen-Off Mirroring:** Mirrors device display while keeping the physical phone screen off, eliminating battery drain and thermal heat.
- **MP4 Video Recording:** Direct 1-click high-definition screen recording saved to `recordings/`.
- **Always-on-Top & Audio Controls:** Keep the mirror window floating and toggle audio forwarding on/off.
- **1-Click scrcpy Downloader:** Automatically downloads official release binaries if missing on host OS.

### ⚡ 2. One-Click Optimization Profiles
- **🎮 Gaming & Ultra Performance:** Instant 0.0x animations, 120Hz/144Hz refresh rate lock, GOS/Joyose throttling bypass, and Cloudflare gaming DNS.
- **🔋 Extreme Battery Saver:** 60Hz lock, aggressive Doze deep sleep standby tuning, Wi-Fi scan throttling, background analytics suspension.
- **🛡️ Ultra Privacy & Clean:** AdGuard Encrypted DoT DNS, telemetry daemons isolation, lockscreen ad carousels deactivation.
- **⚖️ Balanced Daily Driver:** 0.5x responsive UI transitions, adaptive dynamic Hz, and Cloudflare privacy DNS.

### 📦 3. Advanced APK Management Suite
- **Batch APK Installer:** Drag-and-drop multiple `.apk` files to install them seamlessly to user 0.
- **APK Extractor / Dumper:** Search installed applications and dump raw base `.apk` files directly to your computer (`extracted_apks/`).

### 🖥️ 4. Screen Resolution & DPI Customizer
- **Resolution Tuning (`wm size`):** Switch between FHD+ (1080p), QHD+ (1440p), HD+ (720p), or custom width × height to reduce GPU load and battery drain.
- **DPI Density Scaling (`wm density`):** Scale interface density or force dual-column **Tablet Mode** in apps with 1-click Reset to Native resolution/density.

### 🔍 5. Deep Hardware & Telemetry Diagnostics
- **SoC & Processor:** Chipset model, CPU ABI architecture (`arm64-v8a`), device codename, manufacturer, and build ID.
- **Display Telemetry:** Panel resolution, pixel density (DPI), active refresh rate, and dynamic refresh rate levels (60Hz / 90Hz / 120Hz / 144Hz).
- **Battery & Thermal Monitoring:** Live `dumpsys battery` extraction for core battery temperature (°C), voltage (V), health state, and power source.
- **Security & System Status:** Root detection (Magisk/KernelSU), SELinux enforcement level (*Enforcing/Permissive*), Android & SDK release, and security patch date.

### 🗑️ 6. Safe Debloat Hub
- **Risk Classification:** Safe, Moderate, and Advanced risk tier categorization.
- **Non-Destructive Removal:** Uses `--user 0` isolation to safely disable apps without altering system read-only partitions.
- **Bulk Action Bar:** Floating action toolbar to apply or debloat multiple selected items simultaneously.

### 🛡️ 7. 1-Click Rollback & Detailed Diff Inspector
- **Automatic State Snapshots:** Every tweak or debloat action automatically captures device name, formatted timestamp, and exact global/system/secure settings values into `device_backups/<device_id>_<timestamp>.json`.
- **Detailed Diff Viewer:** Inspects precisely what settings and packages will be restored before executing a rollback.
- **System Whitelist Protection:** Strict safety barrier preventing accidental deletion of vital OS packages (`SystemUI`, `Launcher`, `Dialer`, `Play Services`, `Settings`, `KeyChain`).

### 💻 8. Interactive ADB Shell Drawer & Quick Presets
- Top-right **Terminal Console** button triggers a slide-up terminal drawer on any screen.
- Real-time ANSI colored execution stream and 1-click diagnostic command presets (`dumpsys battery`, `wm size`, `getprop`, `pm list`).

### ⬇️ 9. 1-Click Google ADB Platform-Tools Downloader
- Detects if ADB is missing on the system and automatically downloads official Google platform-tools archives directly into `binaries/platform-tools/`.

### 🌐 10. Multi-Language Localization (i18n)
- Seamless real-time language switching between **English (EN)** and **Türkçe (TR)**.

---

## 📱 Supported OEM Presets

| Manufacturer / UI | Pre-configured Debloat & Tweaks | Risk Level | Status |
| :--- | :--- | :--- | :---: |
| **Samsung One UI** | Bixby Voice/Agent, GOS Bypass, Knox Analytics, RAM Plus Disable, Samsung Pay | `Safe` / `Moderate` | ✅ Supported |
| **Xiaomi HyperOS / MIUI** | MSA (System Ads), Joyose Throttler, GetApps Store, Wallpaper Carousel, Mi Video | `Safe` / `Moderate` | ✅ Supported |
| **Google Pixel** | Pixel Tips, Sound Search/Now Playing, Device Health Services, Columbus Gestures | `Safe` / `Moderate` | ✅ Supported |
| **Generic Android AOSP** | 0.5x Animations, 120Hz Force Peak, AdGuard/Cloudflare DNS, Aggressive Doze | `Safe` / `Moderate` | ✅ Supported |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[User Interface - React 18 + TypeScript + Tailwind] --> B[Zustand State Stores]
    B --> C[Unified AdbBridge Layer]
    C -->|Tauri IPC Invoke| D[Rust Backend - Tauri v2]
    D --> E[AdbClient & Process Runner]
    D --> F[scrcpy Mirror Manager]
    D --> G[Rule & Recommendation Engine]
    D --> H[Backup & Rollback Manager]
    E --> I[Android Device - USB / Wi-Fi ADB]
    F --> I
    H --> J[(device_backups/*.json)]
    G --> K[(rules_db/*.json)]
```

---

## 📥 Download & Installation (For End Users)

No development tools, Node.js, or Rust are required to use NexusTweak!

1. Go to the latest **[GitHub Releases](https://github.com/burakzdgn/NexusTweak/releases)**.
2. Download the installer for your operating system:
   - **Windows:** `NexusTweak-Setup.exe` (or `.msi`)
   - **macOS:** `NexusTweak.dmg`
   - **Linux:** `NexusTweak.deb` / `NexusTweak.AppImage`
3. Launch the application and connect your Android device via USB (with **USB Debugging** enabled).
4. *Tip:* If ADB is not installed on your computer, NexusTweak features a **1-Click Google ADB Downloader** that automatically configures platform-tools for you.

---

## 🛠️ Running from Source (For Developers)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- Android device with **Developer Options** and **USB Debugging** enabled.

### 1. Clone the Repository
```bash
git clone https://github.com/burakzdgn/NexusTweak.git
cd NexusTweak
```

### 2. Quick 1-Click Launch (Windows)
Double-click `run.bat` or execute in PowerShell:
```cmd
run.bat
```

### 3. Or Run Manually
```bash
npm install
npm run tauri dev
```

### 4. Build Production Desktop Installer
```bash
npm run tauri build
```
> Generated binary packages (`.msi`, `.exe`, `.dmg`, `.deb`) will be located in `src-tauri/target/release/bundle/`.

---

## 📜 Third-Party Attributions

- **[scrcpy](https://github.com/Genymobile/scrcpy)** — Screen mirroring and device control engine, licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) (Copyright Genymobile / Romain Vimont).
- **Google Android Platform-Tools** — Official ADB binaries distributed by Google under the Android Software Development Kit License.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Take full control of your Android device. Designed with precision for power users and the open-source community.</sub>
</div>
