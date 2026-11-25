/* @license Enterprise */

import { isRelatedRecordPathFollowed } from 'src/engine/permissions/internal/access-group/utils/is-related-record-path-followed.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

type ComputeToPlan = {
  objectMetadataId: string;
  fromRelatedObjectMetadataIds: string[];
};

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
}): string[] => {
  const computesToPlan: ComputeToPlan[] = objectMetadataIds.map(
    (objectMetadataId) => ({
      objectMetadataId,
      fromRelatedObjectMetadataIds: [],
    }),
  );

  for (const [
    index,
    { objectMetadataId, fromRelatedObjectMetadataIds },
  ] of computesToPlan.entries()) {
    const followingObjectMetadataIds = new Set(
      resolvedRelatedRecordPaths
        .filter(
          (resolvedPath) =>
            resolvedPath.sourceFlatObjectMetadata.id === objectMetadataId &&
            isRelatedRecordPathFollowed({
              resolvedPath,
              objectMetadataId,
              fromRelatedObjectMetadataIds,
            }) &&
            isObjectUsingRecordAccessGroups(
              resolvedPath.targetObjectMetadataId,
            ),
        )
        .map(({ targetObjectMetadataId }) => targetObjectMetadataId),
    );

    for (const followingObjectMetadataId of followingObjectMetadataIds) {
      const isAlreadyPlannedAfter = computesToPlan
        .slice(index + 1)
        .some(
          (computeToPlan) =>
            computeToPlan.objectMetadataId === followingObjectMetadataId &&
            computeToPlan.fromRelatedObjectMetadataIds.length > 0,
        );

      if (!isAlreadyPlannedAfter) {
        computesToPlan.push({
          objectMetadataId: followingObjectMetadataId,
          fromRelatedObjectMetadataIds: [
            ...fromRelatedObjectMetadataIds,
            objectMetadataId,
          ],
        });
      }
    }
  }

  return computesToPlan
    .map(({ objectMetadataId }) => objectMetadataId)
    .filter(
      (objectMetadataId, index, plannedObjectMetadataIds) =>
        objectMetadataId !== plannedObjectMetadataIds[index - 1],
    );
};
