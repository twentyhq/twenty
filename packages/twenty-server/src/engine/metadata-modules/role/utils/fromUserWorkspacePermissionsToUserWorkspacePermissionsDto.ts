import {
  PermissionsOnAllObjectRecords,
  SettingPermissionType,
} from 'twenty-shared/constants';
import { UserWorkspacePermissions } from 'twenty-shared/types';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

export type UserWorkspacePermissionsDto = Pick<
  UserWorkspace,
  'objectPermissions' | 'settingsPermissions' | 'objectRecordsPermissions'
>;

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
