import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type JobGroupLimiter = {
  max: number;
  durationMs: number;
};

export type JobGroupManifest = SyncableEntityOptions & {
  name: string;
  limiter: JobGroupLimiter;
};
