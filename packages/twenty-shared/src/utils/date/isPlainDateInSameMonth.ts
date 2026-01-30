import { type Temporal } from 'temporal-polyfill';

export const isPlainDateInSameMonth = (
  plainDateA: Temporal.PlainDate,
  plainDateB: Temporal.PlainDate,
) => {
  return (
    plainDateA.month === plainDateB.month && plainDateA.year === plainDateB.year
  );
};
