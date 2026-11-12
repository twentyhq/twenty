/* @license Enterprise */

import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { buildRecordAccessGroupComputeId } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-compute-id.util';
import { isRelatedRecordPathFollowed } from 'src/engine/permissions/internal/access-group/utils/is-related-record-path-followed.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

type PlannedRecordAccessGroupCompute = Required<
  Pick<
    RecomputeRecordAccessGroupIdsJobData,
    'objectMetadataId' | 'propagatedFromObjectMetadataIds'
  >
>;

export const planRecordAccessGroupComputes = ({
  objectMetadataIds,
  resolvedRelatedRecordPaths,
  isObjectUsingRecordAccessGroups,
}: {
  objectMetadataIds: string[];
  resolvedRelatedRecordPaths: Pick<
    ResolvedRelatedRecordPath,
    'isInherent' | 'sourceFlatObjectMetadata' | 'targetObjectMetadataId'
  >[];
  isObjectUsingRecordAccessGroups: (objectMetadataId: string) => boolean;
}): PlannedRecordAccessGroupCompute[] => {
  const plannedComputeById = new Map<string, PlannedRecordAccessGroupCompute>();
  const computesToVisit: PlannedRecordAccessGroupCompute[] =
    objectMetadataIds.map((objectMetadataId) => ({
      objectMetadataId,
      propagatedFromObjectMetadataIds: [],
    }));

  for (const compute of computesToVisit) {
    const computeId = buildRecordAccessGroupComputeId(compute);

    if (plannedComputeById.has(computeId)) {
      continue;
    }

    plannedComputeById.set(computeId, compute);

    const { objectMetadataId, propagatedFromObjectMetadataIds } = compute;
    const followingObjectMetadataIds = new Set(
      resolvedRelatedRecordPaths
        .filter(
          (resolvedPath) =>
            resolvedPath.sourceFlatObjectMetadata.id === objectMetadataId &&
            isRelatedRecordPathFollowed({
              resolvedPath,
              objectMetadataId,
              propagatedFromObjectMetadataIds,
            }) &&
            isObjectUsingRecordAccessGroups(
              resolvedPath.targetObjectMetadataId,
            ),
        )
        .map(({ targetObjectMetadataId }) => targetObjectMetadataId),
    );

    for (const followingObjectMetadataId of followingObjectMetadataIds) {
      computesToVisit.push({
        objectMetadataId: followingObjectMetadataId,
        propagatedFromObjectMetadataIds: [
          ...propagatedFromObjectMetadataIds,
          objectMetadataId,
        ],
      });
    }
  }

  return [...plannedComputeById.values()];
};
