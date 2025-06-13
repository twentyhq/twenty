import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { ObjectRecordsPermissions } from 'twenty-shared/types';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

export type UserWorkspacePermissions = {
  settingsPermissions: Record<SettingPermissionType, boolean>;
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  objectPermissions: ObjectRecordsPermissions;
};
