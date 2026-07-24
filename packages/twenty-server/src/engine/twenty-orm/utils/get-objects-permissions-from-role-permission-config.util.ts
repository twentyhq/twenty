import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// Multi-role union/intersection is not ready — use the first assigned role only.
export const getObjectsPermissionsFromRolePermissionConfig = ({
  rolesPermissions,
  rolePermissionConfig,
}: {
  rolesPermissions: ObjectsPermissionsByRoleId;
  rolePermissionConfig: RolePermissionConfig;
}): ObjectsPermissions => {
  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {};
  }

  const roleId =
    'intersectionOf' in rolePermissionConfig
      ? rolePermissionConfig.intersectionOf[0]
      : 'unionOf' in rolePermissionConfig
        ? rolePermissionConfig.unionOf[0]
        : undefined;

  if (!isDefined(roleId)) {
    return {};
  }

  return rolesPermissions[roleId] ?? {};
};
