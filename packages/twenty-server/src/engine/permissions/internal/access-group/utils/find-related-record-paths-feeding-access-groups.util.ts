/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { isObjectRestrictedByRlsRule } from 'src/engine/permissions/internal/rls/utils/is-object-restricted-by-rls-rule.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

export const findRelatedRecordPathsFeedingAccessGroups = ({
  rolesPermissions,
  resolvedRelatedRecordPaths,
  objectMetadataId,
  visitedObjectMetadataIds = [],
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  objectMetadataId: string;
  visitedObjectMetadataIds?: string[];
}): ResolvedRelatedRecordPath[] => {
  const nextVisitedObjectMetadataIds = [
    ...visitedObjectMetadataIds,
    objectMetadataId,
  ];

  return resolvedRelatedRecordPaths.filter(
    ({ isInherent, sourceFlatObjectMetadata, targetObjectMetadataId }) =>
      targetObjectMetadataId === objectMetadataId &&
      !temporaryExcludePermissionStorageObject(sourceFlatObjectMetadata) &&
      (isObjectRestrictedByRlsRule({
        rolesPermissions,
        objectMetadataId: sourceFlatObjectMetadata.id,
      }) ||
        (isInherent &&
          !nextVisitedObjectMetadataIds.includes(sourceFlatObjectMetadata.id) &&
          isNonEmptyArray(
            findRelatedRecordPathsFeedingAccessGroups({
              rolesPermissions,
              resolvedRelatedRecordPaths,
              objectMetadataId: sourceFlatObjectMetadata.id,
              visitedObjectMetadataIds: nextVisitedObjectMetadataIds,
            }),
          ))),
  );
};
