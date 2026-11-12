/* @license Enterprise */

import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export const isRelatedRecordPathFollowed = ({
  resolvedPath: { isInherent, targetObjectMetadataId },
  objectMetadataId,
  propagatedFromObjectMetadataIds,
}: {
  resolvedPath: Pick<
    ResolvedRelatedRecordPath,
    'isInherent' | 'targetObjectMetadataId'
  >;
  objectMetadataId: string;
  propagatedFromObjectMetadataIds: string[];
}): boolean =>
  (isInherent || propagatedFromObjectMetadataIds.length === 0) &&
  targetObjectMetadataId !== objectMetadataId &&
  !propagatedFromObjectMetadataIds.includes(targetObjectMetadataId);
