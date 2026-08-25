# 🚀 NexusTweak — Android ADB Optimization & Management Tool

NexusTweak is an open-source, modern, safe, and high-performance Android optimization desktop tool built on **Tauri v2 (Rust Backend)** and **React + TypeScript + Tailwind CSS**.

---

## 🌟 Key Features

1. **Auto Device Identification & Deep Diagnostics**:
   - Live hardware specs extraction: SoC chipset, RAM allocation, display resolution, DPI, and dynamic panel refresh rates (60/90/120Hz).
   - Real-time battery status, health diagnostics, and thermal sensors from `dumpsys battery`.
   - Security state: Root detection, SELinux enforcement level, and Android security patch level.

2. **OEM & Generic Rule Engine**:
   - **Debloat Catalog**: Risk-categorized removal for Samsung OneUI, Xiaomi HyperOS/MIUI, and Google Pixel bloatware with safety whitelist protection.
   - **UI & Animations**: 0.5x, 0.0x instantaneous transitions.
   - **Display Fluidity**: Forced peak 120Hz/144Hz high refresh rate lock.
   - **Privacy & DNS**: 1-click encrypted Cloudflare DoH and AdGuard ad-blocking DoT DNS.
   - **Battery & Doze**: Aggressive deep sleep idle tuning.

3. **SafeGuard Rollback Architecture**:
   - Automatic pre-tweak snapshots stored in `device_backups/<device_id>_<timestamp>.json`.
   - 1-Click State Rollback to undo any modifications.
   - Hardened whitelist protecting critical system components (SystemUI, Play Services, Launcher, Telephony).

4. **Hardware Simulation / Mock Mode**:
   - Full in-memory testing mode with realistic device presets (Galaxy S24 Ultra, Xiaomi 14 Pro, Pixel 8 Pro).

---

## 🛠️ Tech Stack

- **Desktop Framework**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Motion**: [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/)

---

## ⚡ Getting Started

### Development
```bash
# 1. Install dependencies
npm install

# 2. Run in Web Development Mode (Mock Engine)
npm run dev

# 3. Run in Native Desktop App Mode (Tauri)
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```
