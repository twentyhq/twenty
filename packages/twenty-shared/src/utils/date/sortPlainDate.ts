import { type ArraySortDirection } from '@/types/ArraySortDirection';
import { Temporal } from 'temporal-polyfill';

export const sortPlainDate =
  (direction: ArraySortDirection) =>
  (plainDateA: Temporal.PlainDate, plainDateB: Temporal.PlainDate) => {
    const comparisonResult = Temporal.PlainDate.compare(plainDateA, plainDateB);

    if (comparisonResult === 0) {
      return 0;
    }

    return direction === 'asc' ? comparisonResult : -comparisonResult;
  };
