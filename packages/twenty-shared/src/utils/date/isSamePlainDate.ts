import { Temporal } from 'temporal-polyfill';

export const isSamePlainDate = (
  plainDateA: Temporal.PlainDate,
  plainDateB: Temporal.PlainDate,
) => {
  return Temporal.PlainDate.compare(plainDateA, plainDateB) === 0;
};
