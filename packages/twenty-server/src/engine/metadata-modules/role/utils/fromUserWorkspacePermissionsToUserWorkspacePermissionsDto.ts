import { type PermissionsOnAllObjectRecords } from 'twenty-shared/constants';

import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { type UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  objectPermissions: rawObjectPermissions,
  objectRecordsPermissions: rawObjectRecordsPermissions,
  permissionFlags: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectPermissions = Object.entries(rawObjectPermissions).map(
    ([objectMetadataId, permissions]) => ({
      objectMetadataId,
      canReadObjectRecords: permissions.canRead,
      canUpdateObjectRecords: permissions.canUpdate,
      canSoftDeleteObjectRecords: permissions.canSoftDelete,
      canDestroyObjectRecords: permissions.canDestroy,
      restrictedFields: permissions.restrictedFields,
    }),
  );

  const permissionFlags = (
    Object.keys(rawSettingsPermissions) as PermissionFlagType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  const objectRecordsPermissions = (
    Object.keys(rawObjectRecordsPermissions) as PermissionsOnAllObjectRecords[]
  ).filter((feature) => rawObjectRecordsPermissions[feature] === true);

  return {
    objectPermissions,
    objectRecordsPermissions,
    permissionFlags,
  };
};
