import {
  type PermissionFlagType,
  TOOL_PERMISSION_FLAGS,
} from 'twenty-shared/constants';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const hasRoleWideAccessToPermissionFlag = ({
  role,
  permissionFlag,
}: {
  role: Pick<FlatRole, 'canUpdateAllSettings' | 'canAccessAllTools'>;
  permissionFlag: PermissionFlagType;
}): boolean =>
  TOOL_PERMISSION_FLAGS.includes(permissionFlag)
    ? role.canAccessAllTools
    : role.canUpdateAllSettings;
