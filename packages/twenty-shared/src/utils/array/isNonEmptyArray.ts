import { isNumber } from '@sniptt/guards';

export const isNonEmptyArray = <T>(
  probableArray: T[] | readonly T[] | undefined | null,
): probableArray is NonNullable<T[]> => {
  if (
    Array.isArray(probableArray) &&
    isNumber(probableArray.length) &&
    probableArray.length > 0
  ) {
    return true;
  }

  return false;
};
