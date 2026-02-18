import { isDefined } from 'twenty-shared/utils';

import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';

export const filterByRange = (
  results: GroupByRawResult[],
  rangeMin?: number | null,
  rangeMax?: number | null,
): GroupByRawResult[] => {
  return results.filter((result) => {
    const value = result.aggregateValue;

    if (isDefined(rangeMin) && value < rangeMin) {
      return false;
    }

    if (isDefined(rangeMax) && value > rangeMax) {
      return false;
    }

    return true;
  });
};
