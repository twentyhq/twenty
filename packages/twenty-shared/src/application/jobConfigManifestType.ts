import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type JobConfigLimiter = {
  max: number;
  durationMs: number;
};

export type JobConfigManifest = SyncableEntityOptions & {
  key: string;
  limiter: JobConfigLimiter;
};
