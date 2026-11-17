/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findRelatedRecordPathsExtendingAccess } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-paths-extending-access.util';
import { isRelationFieldUnreadableByPrincipals } from 'src/engine/permissions/internal/related-record-path/utils/is-relation-field-unreadable-by-principals.util';

export const findSourceObjectMetadataIdsWithHiddenPath = (
  request: PermissionsObjectAccessRequest,
): Set<string> =>
  new Set(
    findRelatedRecordPathsExtendingAccess(request)
      .filter(({ sourceFlatObjectMetadata, hops }) =>
        isRelationFieldUnreadableByPrincipals({
          principals: request.principals,
          metadataMaps: request.metadataMaps,
          flatObjectMetadata: sourceFlatObjectMetadata,
          relationFieldMetadataId: hops[0].relationFieldMetadataId,
        }),
      )
      .map(({ sourceFlatObjectMetadata }) => sourceFlatObjectMetadata.id),
  );
