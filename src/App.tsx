import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BatchActionBar } from './components/layout/BatchActionBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScreenMirrorView } from './components/mirror/ScreenMirrorView';
import { ProfilesView } from './components/profiles/ProfilesView';
import { TweaksView } from './components/tweaks/TweaksView';
import { ApkManagerView } from './components/apk/ApkManagerView';
import { DisplayCustomizerView } from './components/display/DisplayCustomizerView';
import { DebloatView } from './components/debloat/DebloatView';
import { BackupsView } from './components/backup/BackupsView';
import { TerminalView } from './components/terminal/TerminalView';
import { TerminalDrawer } from './components/terminal/TerminalDrawer';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/ui/Toast';
import { useAdb } from './hooks/useAdb';
import { useLogStore } from './stores/useLogStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  useAdb();
  const logs = useLogStore((s) => s.logs);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'mirror':
        return <ScreenMirrorView />;
      case 'profiles':
        return <ProfilesView />;
      case 'tweaks':
        return <TweaksView />;
      case 'apk':
        return <ApkManagerView />;
      case 'display':
        return <DisplayCustomizerView />;
      case 'debloat':
        return <DebloatView />;
      case 'backups':
        return <BackupsView />;
      case 'terminal':
        return <TerminalView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#090a0f] text-slate-100 overflow-hidden select-none">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0c0e17] to-[#090a0f]">
          {renderActiveView()}
        </main>

        {/* Floating Batch Action Bottom Bar */}
        <BatchActionBar currentTab={activeTab} />

        {/* Interactive Bottom Slide-Up Terminal Drawer */}
        <TerminalDrawer />

        {/* Floating Action Toasts */}
        <ToastContainer logs={logs} />
      </div>
    </div>
  );
};

export default App;
