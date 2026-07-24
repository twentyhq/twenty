import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';

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

  if ('intersectionOf' in rolePermissionConfig) {
    const allRolePermissions = rolePermissionConfig.intersectionOf.map(
      (roleId) => rolesPermissions[roleId] ?? {},
    );

    return allRolePermissions.length === 1
      ? allRolePermissions[0]
      : computePermissionIntersection(allRolePermissions);
  }

  if ('unionOf' in rolePermissionConfig) {
    if (rolePermissionConfig.unionOf.length === 1) {
      return rolesPermissions[rolePermissionConfig.unionOf[0]] ?? {};
    }

    throw new Error(
      'Union permission logic for multiple roles not yet implemented',
    );
  }

  return {};
};
