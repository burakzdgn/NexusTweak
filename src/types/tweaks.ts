export type RiskLevel = 'Safe' | 'Moderate' | 'Advanced';

export type TweakCategory =
  | 'all'
  | 'animations'
  | 'display'
  | 'battery'
  | 'privacy'
  | 'performance'
  | 'network'
  | 'debloat';

export interface TweakRule {
  id: string;
  name: string;
  description: string;
  category: string;
  risk: RiskLevel;
  targetOem: string;
  minSdk?: number;
  maxSdk?: number;
  packages?: string[];
  applyCommands: string[];
  revertCommands: string[];
  verifyCommand?: string;
  expectedValue?: string;
  currentValue?: string;
  isApplied?: boolean;
  tags: string[];
}
