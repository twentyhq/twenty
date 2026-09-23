import { isNumber } from '@sniptt/guards';

// Narrows to a non-empty tuple rather than T[], so that under
// noUncheckedIndexedAccess a guarded array still yields T at index 0
export const isNonEmptyArray = <T>(
  probableArray: T[] | readonly T[] | undefined | null,
): probableArray is [T, ...T[]] => {
  if (
    Array.isArray(probableArray) &&
    isNumber(probableArray.length) &&
    probableArray.length > 0
  ) {
    return true;
  }

  return false;
};
