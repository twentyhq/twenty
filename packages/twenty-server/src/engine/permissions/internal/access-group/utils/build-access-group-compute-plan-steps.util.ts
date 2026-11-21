/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type AccessGroupComputePlanStep } from 'src/engine/permissions/internal/access-group/types/access-group-compute-plan-step.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/value-lookup/utils/find-access-group-value-lookups.util';
import { isAccessGroupSyncIncremental } from 'src/engine/permissions/internal/access-group/value-lookup/utils/is-access-group-sync-incremental.util';

type ChangedAccessGroup = Pick<
  AccessGroup,
  'compactId' | 'objectMetadataId' | 'ruleShapeHash'
>;

export const buildAccessGroupComputePlanSteps = ({
  insertedAccessGroups,
  staleAccessGroups,
  relatedRecordPathTargetObjectMetadataIds,
  metadataMaps,
}: {
  insertedAccessGroups: ChangedAccessGroup[];
  staleAccessGroups: ChangedAccessGroup[];
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
  const findCompactIdsOfObject = (
    accessGroups: ChangedAccessGroup[],
    objectMetadataId: string,
  ) =>
    accessGroups
      .filter(
        (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
      )
      .map(({ compactId }) => compactId);

  const changedAccessGroups = [
    ...insertedAccessGroups,
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
        addedCompactIds: findCompactIdsOfObject(
          insertedAccessGroups,
          incrementalObjectMetadataId,
        ),
        removedCompactIds: findCompactIdsOfObject(
          staleAccessGroups,
          incrementalObjectMetadataId,
        ),
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
