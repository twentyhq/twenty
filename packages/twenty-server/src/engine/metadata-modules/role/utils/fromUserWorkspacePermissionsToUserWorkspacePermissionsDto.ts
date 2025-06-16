import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { UserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/dtos/user-workspace-permissions.dto';

export const fromUserWorkspacePermissionsToUserWorkspacePermissionsDto = ({
  objectPermissions: rawObjectPermissions,
  objectRecordsPermissions: rawObjectRecordsPermissions,
  settingsPermissions: rawSettingsPermissions,
}: UserWorkspacePermissions): UserWorkspacePermissionsDto => {
  const objectPermissions = Object.entries(rawObjectPermissions).map(
    ([objectMetadataId, permissions]) => ({
      objectMetadataId,
      canReadObjectRecords: permissions.canRead,
      canUpdateObjectRecords: permissions.canUpdate,
      canSoftDeleteObjectRecords: permissions.canSoftDelete,
      canDestroyObjectRecords: permissions.canDestroy,
    }),
  );

  const settingsPermissions = (
    Object.keys(rawSettingsPermissions) as SettingPermissionType[]
  ).filter((feature) => rawSettingsPermissions[feature] === true);

  const objectRecordsPermissions = (
    Object.keys(rawObjectRecordsPermissions) as PermissionsOnAllObjectRecords[]
  ).filter((feature) => rawObjectRecordsPermissions[feature] === true);

  return {
    objectPermissions,
    objectRecordsPermissions,
    settingsPermissions,
  };
};
