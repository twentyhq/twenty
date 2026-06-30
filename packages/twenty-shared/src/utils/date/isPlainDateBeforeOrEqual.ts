import { Temporal } from 'temporal-polyfill';

export const isPlainDateBeforeOrEqual = (
  plainDateA: Temporal.PlainDate,
  plainDateB: Temporal.PlainDate,
) => {
  const comparisonResult = Temporal.PlainDate.compare(plainDateA, plainDateB);

  return comparisonResult <= 0;
};
