import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { filterOutUnresolvedRelationBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-unresolved-relation-buckets.util';

const buildResolution = (
  unresolvedRecordIds: string[],
): RelationLabelResolution => ({
  labelByRecordId: new Map<string, string>(),
  unresolvedRecordIds: new Set(unresolvedRecordIds),
});

describe('filterOutUnresolvedRelationBuckets', () => {
  it('should drop rows whose primary dimension is unresolved', () => {
    const rawResults: GroupByRawResult[] = [
      { groupByDimensionValues: ['agent-id-1'], aggregateValue: 8 },
      { groupByDimensionValues: ['agent-id-2'], aggregateValue: 5 },
    ];

    const result = filterOutUnresolvedRelationBuckets({
      rawResults,
      primaryRelationLabelResolution: buildResolution(['agent-id-2']),
      secondaryRelationLabelResolution: undefined,
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['agent-id-1'], aggregateValue: 8 },
    ]);
  });

  it('should drop rows whose secondary dimension is unresolved', () => {
    const rawResults: GroupByRawResult[] = [
      {
        groupByDimensionValues: ['2024-01-01', 'agent-id-1'],
        aggregateValue: 8,
      },
      {
        groupByDimensionValues: ['2024-01-01', 'agent-id-2'],
        aggregateValue: 5,
      },
    ];

    const result = filterOutUnresolvedRelationBuckets({
      rawResults,
      primaryRelationLabelResolution: undefined,
      secondaryRelationLabelResolution: buildResolution(['agent-id-2']),
    });

    expect(result).toEqual([
      {
        groupByDimensionValues: ['2024-01-01', 'agent-id-1'],
        aggregateValue: 8,
      },
    ]);
  });

  it('should keep null "Not Set" rows', () => {
    const rawResults: GroupByRawResult[] = [
      { groupByDimensionValues: [null], aggregateValue: 3 },
      { groupByDimensionValues: ['agent-id-2'], aggregateValue: 5 },
    ];

    const result = filterOutUnresolvedRelationBuckets({
      rawResults,
      primaryRelationLabelResolution: buildResolution(['agent-id-2']),
      secondaryRelationLabelResolution: undefined,
    });

    expect(result).toEqual([
      { groupByDimensionValues: [null], aggregateValue: 3 },
    ]);
  });

  it('should return the input unchanged when no resolution is provided', () => {
    const rawResults: GroupByRawResult[] = [
      { groupByDimensionValues: ['agent-id-1'], aggregateValue: 8 },
      { groupByDimensionValues: ['agent-id-2'], aggregateValue: 5 },
    ];

    const result = filterOutUnresolvedRelationBuckets({
      rawResults,
      primaryRelationLabelResolution: undefined,
      secondaryRelationLabelResolution: undefined,
    });

    expect(result).toBe(rawResults);
  });

  it('should only apply the secondary resolution when the primary axis is not a relation', () => {
    const rawResults: GroupByRawResult[] = [
      {
        groupByDimensionValues: ['agent-id-2', 'agent-id-1'],
        aggregateValue: 8,
      },
      {
        groupByDimensionValues: ['agent-id-1', 'agent-id-2'],
        aggregateValue: 5,
      },
    ];

    const result = filterOutUnresolvedRelationBuckets({
      rawResults,
      primaryRelationLabelResolution: undefined,
      secondaryRelationLabelResolution: buildResolution(['agent-id-2']),
    });

    expect(result).toEqual([
      {
        groupByDimensionValues: ['agent-id-2', 'agent-id-1'],
        aggregateValue: 8,
      },
    ]);
  });
});
