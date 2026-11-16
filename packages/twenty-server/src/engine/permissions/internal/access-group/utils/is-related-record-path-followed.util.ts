/* @license Enterprise */

import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export const isRelatedRecordPathFollowed = ({
  resolvedPath: { isInherent, targetObjectMetadataId },
  objectMetadataId,
  fromRelatedObjectMetadataIds,
}: {
  resolvedPath: Pick<
    ResolvedRelatedRecordPath,
    'isInherent' | 'targetObjectMetadataId'
  >;
  objectMetadataId: string;
  fromRelatedObjectMetadataIds: string[];
}): boolean =>
  (isInherent || fromRelatedObjectMetadataIds.length === 0) &&
  targetObjectMetadataId !== objectMetadataId &&
  !fromRelatedObjectMetadataIds.includes(targetObjectMetadataId);
