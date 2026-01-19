import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const filterTwoDimensionalDataByRange = <
  T extends Record<string, string | number>,
>(
  data: T[],
  keys: string[],
  rangeMin?: number | null,
  rangeMax?: number | null,
): T[] => {
  if (!isDefined(rangeMin) && !isDefined(rangeMax)) {
    return data;
  }

  return data.filter((datum) => {
    const totalValue = keys.reduce((sum, key) => {
      const value = datum[key];

      return sum + (isNumber(value) ? value : 0);
    }, 0);

    if (isDefined(rangeMin) && totalValue < rangeMin) {
      return false;
    }

    if (isDefined(rangeMax) && totalValue > rangeMax) {
      return false;
    }

    return true;
  });
};
