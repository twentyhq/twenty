import {
  type PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type PermissionFlagPermissionType } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { PERMISSION_FLAG_PERMISSION_TYPE_BY_PERMISSION_FLAG } from 'src/engine/metadata-modules/permissions/constants/permission-flag-permission-type-by-permission-flag.constant';

const isGrantedByRoleWideAccess = ({
  role,
  permissionFlag,
}: {
  role: Pick<FlatRole, 'canUpdateAllSettings' | 'canAccessAllTools'>;
  permissionFlag: PermissionFlagType;
}): boolean => {
  const permissionType: PermissionFlagPermissionType | undefined =
    PERMISSION_FLAG_PERMISSION_TYPE_BY_PERMISSION_FLAG[permissionFlag];

  switch (permissionType) {
    case 'settings':
      return role.canUpdateAllSettings;
    case 'tool':
      return role.canAccessAllTools;
    default:
      return false;
  }
};

export const isPermissionFlagGranted = ({
  role,
  permissionFlag,
  isPermissionFlagAssignedToRole,
}: {
  role: Pick<FlatRole, 'canUpdateAllSettings' | 'canAccessAllTools'>;
  permissionFlag: PermissionFlagType;
  isPermissionFlagAssignedToRole: (
    permissionFlagUniversalIdentifier: string,
  ) => boolean;
}): boolean =>
  isGrantedByRoleWideAccess({ role, permissionFlag }) ||
  isPermissionFlagAssignedToRole(SystemPermissionFlag[permissionFlag]);
