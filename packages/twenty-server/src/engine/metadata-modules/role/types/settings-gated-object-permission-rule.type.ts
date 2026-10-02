import { type PermissionFlagType } from 'twenty-shared/constants';

export type SettingsGatedObjectPermissionRule = {
  permissionFlag: PermissionFlagType;
  isAlwaysReadable: boolean;
  appliesFieldPermissions: boolean;
};
