import { JOB_CONFIG_KEY_PATTERN } from '@/application/constants/JobConfigKeyPattern';
import { type JobConfigManifest } from '@/application/jobConfigManifestType';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

export const getJobConfigManifestErrors = (
  jobConfig: Partial<JobConfigManifest>,
): string[] => {
  const errors: string[] = [];
  const max = jobConfig.limiter?.max;
  const durationMs = jobConfig.limiter?.durationMs;

  if (!isValidUniversalIdentifier(jobConfig.universalIdentifier ?? '')) {
    errors.push(
      `Job config "${jobConfig.key}" must have a valid universalIdentifier`,
    );
  }

  if (!JOB_CONFIG_KEY_PATTERN.test(jobConfig.key ?? '')) {
    errors.push(
      `Job config key must match ${JOB_CONFIG_KEY_PATTERN} (got "${jobConfig.key}")`,
    );
  }

  if (!Number.isInteger(max) || (max ?? 0) <= 0) {
    errors.push(
      `Job config "${jobConfig.key}" limiter max must be a positive integer`,
    );
  }

  if (!Number.isFinite(durationMs) || (durationMs ?? 0) <= 0) {
    errors.push(
      `Job config "${jobConfig.key}" limiter durationMs must be a positive number`,
    );
  }

  return errors;
};
