import {
  type PermissionFlagType,
  SystemPermissionFlag,
  TOOL_PERMISSION_FLAGS,
} from 'twenty-shared/constants';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const isPermissionFlagGranted = ({
  role,
  permissionFlag,
  assignedPermissionFlagUniversalIdentifiers,
}: {
  role: Pick<FlatRole, 'canUpdateAllSettings' | 'canAccessAllTools'>;
  permissionFlag: PermissionFlagType;
  assignedPermissionFlagUniversalIdentifiers: ReadonlySet<string>;
}): boolean => {
  const isGrantedByRoleWideAccess = TOOL_PERMISSION_FLAGS.includes(
    permissionFlag,
  )
    ? role.canAccessAllTools
    : role.canUpdateAllSettings;

  return (
    isGrantedByRoleWideAccess === true ||
    assignedPermissionFlagUniversalIdentifiers.has(
      SystemPermissionFlag[permissionFlag],
    )
  );
};
