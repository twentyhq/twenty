/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';

type ChangedAccessGroup = Pick<
  AccessGroupWithoutCompactId,
  'objectMetadataId' | 'rowLevelPermissionPredicateGroupId'
>;

// Family groups are added to or removed from their own records, any other change recomputes the whole object
export const planAccessGroupSyncRecomputes = ({
  changedAccessGroups,
  familyRuleIdsByObjectMetadataId,
  maxIncrementalChangesPerObject,
}: {
  changedAccessGroups: ChangedAccessGroup[];
  familyRuleIdsByObjectMetadataId: Map<string, Set<string>>;
  maxIncrementalChangesPerObject: number;
}): {
  fullRecomputeObjectMetadataIds: string[];
  incrementalObjectMetadataIds: string[];
} => {
  const changedAccessGroupsByObjectMetadataId = new Map<
    string,
    ChangedAccessGroup[]
  >();

  for (const changedAccessGroup of changedAccessGroups) {
    changedAccessGroupsByObjectMetadataId.set(
      changedAccessGroup.objectMetadataId,
      [
        ...(changedAccessGroupsByObjectMetadataId.get(
          changedAccessGroup.objectMetadataId,
        ) ?? []),
        changedAccessGroup,
      ],
    );
  }

  const objectMetadataIds = [...changedAccessGroupsByObjectMetadataId.keys()];
  const isIncremental = (objectMetadataId: string): boolean => {
    const objectChangedAccessGroups =
      changedAccessGroupsByObjectMetadataId.get(objectMetadataId) ?? [];
    const familyRuleIds = familyRuleIdsByObjectMetadataId.get(objectMetadataId);

    return (
      objectChangedAccessGroups.length <= maxIncrementalChangesPerObject &&
      objectChangedAccessGroups.every(
        ({ rowLevelPermissionPredicateGroupId }) =>
          isDefined(rowLevelPermissionPredicateGroupId) &&
          (familyRuleIds?.has(rowLevelPermissionPredicateGroupId) ?? false),
      )
    );
  };

  return {
    fullRecomputeObjectMetadataIds: objectMetadataIds.filter(
      (objectMetadataId) => !isIncremental(objectMetadataId),
    ),
    incrementalObjectMetadataIds: objectMetadataIds.filter(isIncremental),
  };
};
