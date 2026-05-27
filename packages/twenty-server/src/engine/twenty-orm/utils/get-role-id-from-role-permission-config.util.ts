import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const getRoleIdFromRolePermissionConfig = (
  rolePermissionConfig: RolePermissionConfig | null | undefined,
): string | undefined => {
  if (!isDefined(rolePermissionConfig)) {
    return undefined;
  }

  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return undefined;
  }

  if ('intersectionOf' in rolePermissionConfig) {
    return rolePermissionConfig.intersectionOf[0];
  }

  if ('unionOf' in rolePermissionConfig) {
    return rolePermissionConfig.unionOf[0];
  }

  return undefined;
};
