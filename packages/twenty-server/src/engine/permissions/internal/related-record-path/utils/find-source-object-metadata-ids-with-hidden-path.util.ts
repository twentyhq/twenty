/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findRelatedRecordPathsExtendingAccess } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-paths-extending-access.util';

export const findSourceObjectMetadataIdsWithHiddenPath = ({
  request,
  unreadableFieldMetadataIds,
}: {
  request: PermissionsObjectAccessRequest;
  unreadableFieldMetadataIds: Set<string>;
}): Set<string> =>
  new Set(
    findRelatedRecordPathsExtendingAccess(request)
      .filter(({ hops }) =>
        unreadableFieldMetadataIds.has(hops[0].relationFieldMetadataId),
      )
      .map(({ sourceFlatObjectMetadata }) => sourceFlatObjectMetadata.id),
  );
