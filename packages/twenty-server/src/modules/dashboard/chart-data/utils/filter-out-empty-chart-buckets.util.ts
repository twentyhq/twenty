import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';

export const filterOutEmptyChartBuckets = ({
  rawResults,
  shouldOmitEmptyBuckets,
}: {
  rawResults: GroupByRawResult[];
  shouldOmitEmptyBuckets: boolean;
}): GroupByRawResult[] => {
  if (!shouldOmitEmptyBuckets) {
    return rawResults;
  }

  return rawResults.filter(
    (result) =>
      isNonEmptyArray(result.groupByDimensionValues) &&
      result.groupByDimensionValues.every(isDefined) &&
      Number.isFinite(result.aggregateValue) &&
      result.aggregateValue !== 0,
  );
};
