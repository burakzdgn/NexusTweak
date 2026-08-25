export interface QueuedApk {
  id: string;
  name: string;
  sizeBytes: number;
  path: string;
  status: 'pending' | 'installing' | 'success' | 'failed';
  errorMessage?: string;
}

export interface ExtractedApkResult {
  packageName: string;
  outputPath: string;
  timestamp: string;
}
