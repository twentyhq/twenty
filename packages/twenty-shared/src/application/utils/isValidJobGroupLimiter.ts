import { type JobGroupLimiter } from '@/application/jobGroupManifestType';

export const isValidJobGroupLimiter = (
  limiter: Partial<JobGroupLimiter> | undefined,
): boolean =>
  Number.isInteger(limiter?.max) &&
  (limiter?.max ?? 0) > 0 &&
  Number.isFinite(limiter?.durationMs) &&
  (limiter?.durationMs ?? 0) > 0;
