import { isNumber } from '@sniptt/guards';

export const isNonEmptyArray = <TArray extends readonly unknown[]>(
  probableArray: TArray | undefined | null,
): probableArray is TArray & { 0: TArray[number] } => {
  if (
    Array.isArray(probableArray) &&
    isNumber(probableArray.length) &&
    probableArray.length > 0
  ) {
    return true;
  }

  return false;
};
