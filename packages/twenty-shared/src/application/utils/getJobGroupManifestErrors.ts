import { isNonEmptyString } from '@sniptt/guards';

import { type JobGroupManifest } from '@/application/jobGroupManifestType';
import { isValidJobGroupLimiter } from '@/application/utils/isValidJobGroupLimiter';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

export const getJobGroupManifestErrors = (
  jobGroup: Partial<JobGroupManifest>,
): string[] => {
  const errors: string[] = [];

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

  if (!isValidJobGroupLimiter(jobGroup.limiter)) {
    errors.push(
      `Job group "${jobGroup.name}" limiter max must be a positive integer and durationMs a positive number`,
    );
  }

  return errors;
};
