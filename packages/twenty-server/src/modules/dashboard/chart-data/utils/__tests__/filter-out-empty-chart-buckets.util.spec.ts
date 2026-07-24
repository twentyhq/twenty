import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { filterOutEmptyChartBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-empty-chart-buckets.util';

describe('filterOutEmptyChartBuckets', () => {
  it('should return the input unchanged when shouldOmitEmptyBuckets is false', () => {
    const rawResults: GroupByRawResult[] = [
      { groupByDimensionValues: [null], aggregateValue: 0 },
    ];

    const result = filterOutEmptyChartBuckets({
      rawResults,
      shouldOmitEmptyBuckets: false,
    });

    expect(result).toBe(rawResults);
  });

  it('should drop buckets whose primary dimension is null', () => {
    const result = filterOutEmptyChartBuckets({
      rawResults: [
        { groupByDimensionValues: ['Active'], aggregateValue: 5 },
        { groupByDimensionValues: [null], aggregateValue: 3 },
      ],
      shouldOmitEmptyBuckets: true,
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['Active'], aggregateValue: 5 },
    ]);
  });

  it('should drop two-dimensional buckets whose secondary dimension is null', () => {
    const result = filterOutEmptyChartBuckets({
      rawResults: [
        { groupByDimensionValues: ['2024-01-01', 'Acme'], aggregateValue: 5 },
        { groupByDimensionValues: ['2024-01-01', null], aggregateValue: 3 },
      ],
      shouldOmitEmptyBuckets: true,
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['2024-01-01', 'Acme'], aggregateValue: 5 },
    ]);
  });

  it('should drop buckets with zero or non-finite aggregate values', () => {
    const result = filterOutEmptyChartBuckets({
      rawResults: [
        { groupByDimensionValues: ['Active'], aggregateValue: 5 },
        { groupByDimensionValues: ['Zero'], aggregateValue: 0 },
        { groupByDimensionValues: ['NaN'], aggregateValue: Number.NaN },
      ],
      shouldOmitEmptyBuckets: true,
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['Active'], aggregateValue: 5 },
    ]);
  });

  it('should drop buckets with no dimension values', () => {
    const result = filterOutEmptyChartBuckets({
      rawResults: [{ groupByDimensionValues: [], aggregateValue: 5 }],
      shouldOmitEmptyBuckets: true,
    });

    expect(result).toEqual([]);
  });
});
