/* @license Enterprise */

import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const findRelatedRecordPathsGrantingOperation = ({
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsObjectAccessRequest,
  'metadataMaps' | 'flatObjectMetadata' | 'operationType'
>): ResolvedRelatedRecordPath[] => {
  if (
    operationType === 'create' ||
    !areRecordAccessGroupsEnabled(metadataMaps) ||
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
