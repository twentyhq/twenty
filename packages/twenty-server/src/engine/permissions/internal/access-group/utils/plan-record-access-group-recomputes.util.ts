/* @license Enterprise */

import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { buildRecordAccessGroupRecomputeKey } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-recompute-key.util';
import { isRelatedRecordPathFollowed } from 'src/engine/permissions/internal/access-group/utils/is-related-record-path-followed.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

type PlannedRecordAccessGroupRecompute = Required<
  Pick<
    RecomputeRecordAccessGroupIdsJobData,
    'objectMetadataId' | 'propagatedFromObjectMetadataIds'
  >
>;

// Walks the related record paths the way the recompute jobs will, to list every recompute a change leads to
export const planRecordAccessGroupRecomputes = ({
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
}): PlannedRecordAccessGroupRecompute[] => {
  const plannedRecomputeByKey = new Map<
    string,
    PlannedRecordAccessGroupRecompute
  >();
  const recomputesToVisit: PlannedRecordAccessGroupRecompute[] =
    objectMetadataIds.map((objectMetadataId) => ({
      objectMetadataId,
      propagatedFromObjectMetadataIds: [],
    }));

  for (const recompute of recomputesToVisit) {
    const recomputeKey = buildRecordAccessGroupRecomputeKey(recompute);

    if (plannedRecomputeByKey.has(recomputeKey)) {
      continue;
    }

    plannedRecomputeByKey.set(recomputeKey, recompute);

    const { objectMetadataId, propagatedFromObjectMetadataIds } = recompute;
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
      recomputesToVisit.push({
        objectMetadataId: followingObjectMetadataId,
        propagatedFromObjectMetadataIds: [
          ...propagatedFromObjectMetadataIds,
          objectMetadataId,
        ],
      });
    }
  }

  return [...plannedRecomputeByKey.values()];
};
