import { isPositiveInteger } from '@sniptt/guards';
import { doNotTranslate } from '@ui/utilities/utils/doNotTranslate';

export const assertValidToastLimit = (limit: number) => {
  if (!isPositiveInteger(limit)) {
    throw new Error(doNotTranslate('Toast limit must be a positive integer.'));
  }
};
