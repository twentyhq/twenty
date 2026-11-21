/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';

type ChangedAccessGroup = Pick<
  AccessGroup,
  'objectMetadataId' | 'ruleShapeHash'
>;

export const planAccessGroupSyncRecomputes = ({
  changedAccessGroups,
  lookupRuleShapeHashesByObjectMetadataId,
  maxIncrementalChangesPerObject,
}: {
  changedAccessGroups: ChangedAccessGroup[];
  lookupRuleShapeHashesByObjectMetadataId: Map<string, Set<string>>;
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
    const lookupRuleShapeHashes =
      lookupRuleShapeHashesByObjectMetadataId.get(objectMetadataId);

    return (
      objectChangedAccessGroups.length <= maxIncrementalChangesPerObject &&
      objectChangedAccessGroups.every(
        ({ ruleShapeHash }) =>
          lookupRuleShapeHashes?.has(ruleShapeHash) ?? false,
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
