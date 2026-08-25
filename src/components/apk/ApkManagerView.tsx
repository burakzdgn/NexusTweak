import React, { useRef, useState, useMemo } from 'react';
import {
  Upload,
  Download,
  Package,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  HardDrive,
  FileCode,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApkStore } from '../../stores/useApkStore';
import { useDebloatStore } from '../../stores/useDebloatStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerBanner } from '../legal/DisclaimerBanner';

export const ApkManagerView: React.FC = () => {
  const {
    apkQueue,
    isInstalling,
    isExtracting,
    addApksToQueue,
    removeApkFromQueue,
    clearQueue,
    installQueuedApks,
    extractApkFromDevice,
    extractedResults,
  } = useApkStore();

  const packages = useDebloatStore((s) => s.packages);
  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const t = useLanguageStore((s) => s.t);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractSearch, setExtractSearch] = useState('');
  const [appTypeFilter, setAppTypeFilter] = useState<'all' | 'user' | 'system'>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const apks = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith('.apk')
      );
      if (apks.length > 0) addApksToQueue(apks);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const apks = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith('.apk')
      );
      if (apks.length > 0) addApksToQueue(apks);
    }
  };

  const filteredApps = useMemo(() => {
    return packages.filter((p) => {
      if (appTypeFilter === 'user' && p.is_system) return false;
      if (appTypeFilter === 'system' && !p.is_system) return false;
      if (!extractSearch.trim()) return true;
      const q = extractSearch.toLowerCase();
      return (
        p.package_name.toLowerCase().includes(q) ||
        (p.app_name && p.app_name.toLowerCase().includes(q))
      );
    });
  }, [packages, extractSearch, appTypeFilter]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          {t.apk_manager_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.apk_manager_subtitle} (
          <span className="text-cyan-300 font-semibold">
            {activeDevice?.model || 'Android'}
          </span>
          )
        </p>
      </div>

      {/* Batch APK Installer Area */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Batch APK Installer</h3>
              <p className="text-xs text-slate-400">
                Install multiple APKs in parallel to user 0
              </p>
            </div>
          </div>

          {apkQueue.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQueue}
                className="text-xs text-slate-400 hover:text-rose-400"
              >
                Clear Queue
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={installQueuedApks}
                isLoading={isInstalling}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                {t.install_selected_apks} ({apkQueue.length})
              </Button>
            </div>
          )}
        </div>

        {/* Drag Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-800 bg-[#0d101c] hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".apk"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-200">{t.drag_drop_apk}</p>
          <p className="text-[11px] text-cyan-400 mt-1">{t.select_apk_files}</p>
        </div>

        {/* Queued APK List */}
        {apkQueue.length > 0 && (
          <div className="mt-4 space-y-2">
            {apkQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#121524] border border-[#202538] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">
                      ({formatBytes(item.sizeBytes)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'pending' && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Queued
                    </span>
                  )}
                  {item.status === 'installing' && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded animate-pulse">
                      Installing...
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Installed
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  )}

                  <button
                    onClick={() => removeApkFromQueue(item.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* APK Extractor / Dumper Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{t.extract_apk_title}</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                  {filteredApps.length} / {packages.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dump raw base APKs to local <code className="text-cyan-300">extracted_apks/</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-[#121524] rounded-xl border border-[#202538]">
              <button
                onClick={() => setAppTypeFilter('all')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  appTypeFilter === 'all'
                    ? 'bg-purple-500/20 text-purple-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü ({packages.length})
              </button>
              <button
                onClick={() => setAppTypeFilter('user')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  appTypeFilter === 'user'
                    ? 'bg-purple-500/20 text-purple-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kullanıcı ({packages.filter((p) => !p.is_system).length})
              </button>
              <button
                onClick={() => setAppTypeFilter('system')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  appTypeFilter === 'system'
                    ? 'bg-purple-500/20 text-purple-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sistem ({packages.filter((p) => p.is_system).length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.search_apps_to_extract}
                value={extractSearch}
                onChange={(e) => setExtractSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* Extracted Recent Items */}
        {extractedResults.length > 0 && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
            <span className="font-bold text-emerald-400">Recent Extractions:</span>
            <div className="mt-1 space-y-1 text-[11px] text-slate-300 font-mono">
              {extractedResults.map((r, i) => (
                <div key={i} className="flex justify-between">
                  <span>{r.packageName}</span>
                  <span className="text-emerald-300 font-bold">{r.outputPath}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App List Table */}
        <div className="border border-[#202538] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0c0e17] text-slate-400 border-b border-[#202538]">
              <tr>
                <th className="p-3">Application</th>
                <th className="p-3">Package Identifier</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2338]">
              {filteredApps.map((pkg) => (
                <tr key={pkg.package_name} className="hover:bg-[#121524] transition-colors">
                  <td className="p-3 font-semibold text-slate-200">
                    {pkg.app_name || pkg.package_name.split('.').pop()}
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {pkg.package_name}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => extractApkFromDevice(pkg.package_name)}
                      isLoading={isExtracting}
                      leftIcon={<Download className="w-3.5 h-3.5 text-purple-400" />}
                      className="text-xs py-1"
                    >
                      {t.extract_apk_btn}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
