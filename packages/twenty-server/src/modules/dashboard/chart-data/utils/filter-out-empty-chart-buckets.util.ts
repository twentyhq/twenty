import { isDefined } from 'twenty-shared/utils';

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
      isDefined(result.groupByDimensionValues?.[0]) &&
      Number.isFinite(result.aggregateValue) &&
      result.aggregateValue !== 0,
  );
};
