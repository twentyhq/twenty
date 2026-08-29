import { isDefined } from 'twenty-shared/utils';

import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';

export const filterOutUnresolvedRelationBuckets = ({
  rawResults,
  primaryRelationLabelResolution,
  secondaryRelationLabelResolution,
}: {
  rawResults: GroupByRawResult[];
  primaryRelationLabelResolution: RelationLabelResolution | undefined;
  secondaryRelationLabelResolution: RelationLabelResolution | undefined;
}): GroupByRawResult[] => {
  const primaryUnresolvedRecordIds =
    primaryRelationLabelResolution?.unresolvedRecordIds;
  const secondaryUnresolvedRecordIds =
    secondaryRelationLabelResolution?.unresolvedRecordIds;

  if (
    !isDefined(primaryUnresolvedRecordIds) &&
    !isDefined(secondaryUnresolvedRecordIds)
  ) {
    return rawResults;
  }

  return rawResults.filter((result) => {
    const dimensionValues = result.groupByDimensionValues;

    const isPrimaryUnresolved =
      isDefined(primaryUnresolvedRecordIds) &&
      primaryUnresolvedRecordIds.has(String(dimensionValues?.[0]));

    const isSecondaryUnresolved =
      isDefined(secondaryUnresolvedRecordIds) &&
      secondaryUnresolvedRecordIds.has(String(dimensionValues?.[1]));

    return !isPrimaryUnresolved && !isSecondaryUnresolved;
  });
};
