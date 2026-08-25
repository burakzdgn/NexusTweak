import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RotateCcw,
  Lock,
  Sparkles,
  Package,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PackageInfo } from '../../types/debloat';

interface DebloatTableProps {
  packages: PackageInfo[];
  selectedPackages: Set<string>;
  onToggleSelect: (pkg: string) => void;
  onDebloat: (pkg: string) => void;
  onRestore: (pkg: string) => void;
  isProcessing: boolean;
}

export const DebloatTable: React.FC<DebloatTableProps> = ({
  packages,
  selectedPackages,
  onToggleSelect,
  onDebloat,
  onRestore,
  isProcessing,
}) => {
  return (
    <div className="bg-[#11131f] border border-[#202538] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#202538] bg-[#0c0e17]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Select</th>
              <th className="py-3 px-4">Application & Package Name</th>
              <th className="py-3 px-4">Category & Role</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2338] text-xs">
            {packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No packages found matching the active filter.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => {
                const isSelected = selectedPackages.has(pkg.package_name);

                return (
                  <tr
                    key={pkg.package_name}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/10'
                        : 'hover:bg-[#151829]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(pkg.package_name)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>

                    {/* App Name and Package ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            pkg.is_whitelisted
                              ? 'bg-slate-800 text-slate-400'
                              : pkg.bloat_category
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {pkg.is_whitelisted ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Package className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {pkg.app_name || pkg.package_name.split('.').pop()}
                            </span>
                            {pkg.is_whitelisted && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                                Whitelist
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {pkg.package_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Description */}
                    <td className="py-3.5 px-4">
                      {pkg.bloat_category ? (
                        <div>
                          <span className="font-medium text-amber-300">
                            {pkg.bloat_category}
                          </span>
                          {pkg.bloat_description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {pkg.bloat_description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          {pkg.is_system ? 'System Component' : 'User Application'}
                        </span>
                      )}
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3.5 px-4">
                      {pkg.risk_level ? (
                        <Badge risk={pkg.risk_level} size="sm" />
                      ) : pkg.is_whitelisted ? (
                        <span className="text-[11px] text-slate-500 font-mono uppercase">
                          Essential
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Standard</span>
                      )}
                    </td>

                    {/* State: Enabled vs Disabled */}
                    <td className="py-3.5 px-4">
                      {pkg.is_enabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[11px] font-medium border border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right">
                      {pkg.is_enabled ? (
                        <Button
                          variant={pkg.is_whitelisted ? 'outline' : 'danger'}
                          size="sm"
                          onClick={() => onDebloat(pkg.package_name)}
                          isLoading={isProcessing}
                          leftIcon={<Trash2 className="w-3 h-3" />}
                          className="text-xs py-1"
                        >
                          Debloat
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onRestore(pkg.package_name)}
                          isLoading={isProcessing}
                          leftIcon={<RotateCcw className="w-3 h-3 text-cyan-400" />}
                          className="text-xs py-1"
                        >
                          Restore
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
