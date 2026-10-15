import { isPositiveInteger } from '@sniptt/guards';

export const assertValidToastLimit = (limit: number) => {
  if (!isPositiveInteger(limit)) {
    throw new Error('Toast limit must be a positive integer.');
  }
};
