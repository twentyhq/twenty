import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';
import { type ObjectRecordsPermissionsDTO } from 'src/engine/permissions/dtos/object-records-permissions.dto';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  recordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectRecordsPermissions: ObjectRecordsPermissionsDTO[] = [];

  for (const [objectMetadataId, permissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    if (!isDefined(permissions)) {
      continue;
    }

    objectRecordsPermissions.push({
      objectMetadataId,
      canReadAllRecords: permissions.canReadAllRecords,
      canUpdateAllRecords: permissions.canUpdateAllRecords,
      canSoftDeleteAllRecords: permissions.canSoftDeleteAllRecords,
      canDestroyAllRecords: permissions.canDestroyAllRecords,
      restrictedFields: permissions.restrictedFields,
      rowLevelRecordsPermissions: permissions.rowLevelRecordsPermissions,
    });
  }

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  return {
    objectRecordsPermissions,
    permissionFlags,
  };
};
