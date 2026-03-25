import { Temporal } from 'temporal-polyfill';

export const isPlainDateAfter = (
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
) => {
  return Temporal.PlainDate.compare(a, b) === 1;
};
