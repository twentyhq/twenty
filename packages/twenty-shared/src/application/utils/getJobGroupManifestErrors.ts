import { isNonEmptyString } from '@sniptt/guards';

import { type JobGroupManifest } from '@/application/jobGroupManifestType';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

export const getJobGroupManifestErrors = (
  jobGroup: Partial<JobGroupManifest>,
): string[] => {
  const errors: string[] = [];
  const max = jobGroup.limiter?.max;
  const durationMs = jobGroup.limiter?.durationMs;

  if (!isValidUniversalIdentifier(jobGroup.universalIdentifier ?? '')) {
    errors.push(
      `Job group "${jobGroup.name}" must have a valid universalIdentifier`,
    );
  }

  if (!isNonEmptyString(jobGroup.name?.trim())) {
    errors.push(
      `Job group ${jobGroup.universalIdentifier} must have a non-empty name`,
    );
  }

  if (!Number.isInteger(max) || (max ?? 0) <= 0) {
    errors.push(
      `Job group "${jobGroup.name}" limiter max must be a positive integer`,
    );
  }

  if (!Number.isFinite(durationMs) || (durationMs ?? 0) <= 0) {
    errors.push(
      `Job group "${jobGroup.name}" limiter durationMs must be a positive number`,
    );
  }

  return errors;
};
