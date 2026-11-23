import { isNumber } from '@sniptt/guards';

export const reduceExpressionNumbers = ({
  values,
  reduce,
}: {
  values: unknown[];
  reduce: (...numbers: number[]) => number;
}): number | null => {
  const numbers = values.filter(isNumber);

  return numbers.length > 0 ? reduce(...numbers) : null;
};
