import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const getRoleIdsFromRolePermissionConfig = (
  rolePermissionConfig: RolePermissionConfig,
): string[] => {
  if ('intersectionOf' in rolePermissionConfig) {
    return rolePermissionConfig.intersectionOf;
  }

  if ('unionOf' in rolePermissionConfig) {
    return rolePermissionConfig.unionOf;
  }

  return [];
};
