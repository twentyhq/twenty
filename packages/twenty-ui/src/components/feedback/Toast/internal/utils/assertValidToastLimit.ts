import { isPositiveInteger } from '@sniptt/guards';

export const assertValidToastLimit = (limit: number) => {
  if (!isPositiveInteger(limit)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This validates a developer-supplied provider option.
    throw new Error('Toast limit must be a positive integer.');
  }
};
