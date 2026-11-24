import { isNumber } from '@sniptt/guards';

import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

export const reduceExpressionNumbers = ({
  values,
  reduce,
}: {
  values: unknown[];
  reduce: (...numbers: number[]) => number;
}): number | null => {
  const numbers = values.filter(isNumber);

  return isNonEmptyArray(numbers) ? reduce(...numbers) : null;
};
