/* @license Enterprise */

import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const findRelatedRecordPathsExtendingAccess = ({
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsObjectAccessRequest,
  'metadataMaps' | 'flatObjectMetadata' | 'operationType'
>): ResolvedRelatedRecordPath[] => {
  if (
    operationType === 'create' ||
    !isAccessGroupsEnabled(metadataMaps) ||
    temporaryExcludePermissionStorageObject(flatObjectMetadata)
  ) {
    return [];
  }

  return findRelatedRecordPathsFeedingAccessGroups({
    rolesPermissions: metadataMaps.rolesPermissions,
    resolvedRelatedRecordPaths: resolveRelatedRecordPaths(metadataMaps),
    objectMetadataId: flatObjectMetadata.id,
  });
};
