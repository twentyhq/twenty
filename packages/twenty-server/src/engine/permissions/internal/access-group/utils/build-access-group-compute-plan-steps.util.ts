/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupComputePlanStep } from 'src/engine/permissions/internal/access-group/types/access-group-compute-plan-step.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/value-lookup/utils/find-access-group-value-lookups.util';
import { isAccessGroupSyncIncremental } from 'src/engine/permissions/internal/access-group/value-lookup/utils/is-access-group-sync-incremental.util';

type AccessGroupToInsert = Pick<
  AccessGroupWithoutCompactId,
  'groupHash' | 'objectMetadataId' | 'ruleShapeHash'
>;

type StaleAccessGroup = Pick<
  AccessGroup,
  'compactId' | 'objectMetadataId' | 'ruleShapeHash'
>;

export const buildAccessGroupComputePlanSteps = ({
  accessGroupsToInsert,
  staleAccessGroups,
  relatedRecordPathTargetObjectMetadataIds,
  metadataMaps,
}: {
  accessGroupsToInsert: AccessGroupToInsert[];
  staleAccessGroups: StaleAccessGroup[];
  relatedRecordPathTargetObjectMetadataIds: string[];
  metadataMaps: RecordAccessGroupComputationMetadataMaps;
}): Pick<
  AccessGroupComputePlanStep,
  'objectMetadataId' | 'accessGroupIdChanges'
>[] => {
  const isUsingRecordAccessGroups = (objectMetadataId: string) =>
    isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId });
  const planObjects = (objectMetadataIds: string[]) =>
    planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: isUsingRecordAccessGroups,
    });
  const filterAccessGroupsOfObject = <
    TAccessGroup extends Pick<AccessGroup, 'objectMetadataId'>,
  >({
    accessGroups,
    objectMetadataId,
  }: {
    accessGroups: TAccessGroup[];
    objectMetadataId: string;
  }): TAccessGroup[] =>
    accessGroups.filter(
      (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
    );

  const changedAccessGroups = [
    ...accessGroupsToInsert,
    ...staleAccessGroups,
  ].filter(({ objectMetadataId }) =>
    isUsingRecordAccessGroups(objectMetadataId),
  );
  const changedObjectMetadataIds = [
    ...new Set(
      changedAccessGroups.map(({ objectMetadataId }) => objectMetadataId),
    ),
  ];
  const incrementalObjectMetadataIds = changedObjectMetadataIds.filter(
    (objectMetadataId) =>
      isAccessGroupSyncIncremental({
        changedAccessGroups: changedAccessGroups.filter(
          (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
        ),
        accessGroupValueLookups: findAccessGroupValueLookups({
          flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: objectMetadataId,
            flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
          }),
          metadataMaps,
        }),
      }),
  );
  const fullObjectMetadataIds = planObjects([
    ...changedObjectMetadataIds.filter(
      (objectMetadataId) =>
        !incrementalObjectMetadataIds.includes(objectMetadataId),
    ),
    ...relatedRecordPathTargetObjectMetadataIds.filter(
      isUsingRecordAccessGroups,
    ),
  ]);
  const fullObjectMetadataIdSet = new Set(fullObjectMetadataIds);

  // Incremental steps come first so a full step of a path target runs after its sources gained their new ids
  const incrementalSteps = incrementalObjectMetadataIds.flatMap(
    (incrementalObjectMetadataId) => {
      const accessGroupIdChanges = {
        addedGroupHashes: filterAccessGroupsOfObject({
          accessGroups: accessGroupsToInsert,
          objectMetadataId: incrementalObjectMetadataId,
        }).map(({ groupHash }) => groupHash),
        removedCompactIds: filterAccessGroupsOfObject({
          accessGroups: staleAccessGroups,
          objectMetadataId: incrementalObjectMetadataId,
        }).map(({ compactId }) => compactId),
      };

      return [...new Set(planObjects([incrementalObjectMetadataId]))]
        .filter(
          (objectMetadataId) => !fullObjectMetadataIdSet.has(objectMetadataId),
        )
        .map((objectMetadataId) => ({
          objectMetadataId,
          accessGroupIdChanges,
        }));
    },
  );

  return [
    ...incrementalSteps,
    ...fullObjectMetadataIds.map((objectMetadataId) => ({ objectMetadataId })),
  ];
};
