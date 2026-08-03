import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

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
    const permissionsPerRole = rolePermissionConfig.intersectionOf
      .map((roleId) => rolesPermissions[roleId])
      .filter(isDefined);

    // A role that cannot be resolved is a bound that cannot be applied, so deny
    // instead of dropping it and granting whatever the other roles allow.
    if (
      !isNonEmptyArray(permissionsPerRole) ||
      permissionsPerRole.length !== rolePermissionConfig.intersectionOf.length
    ) {
      return {};
    }

    return computePermissionIntersection(permissionsPerRole);
  }

  // Union across several roles is still unimplemented, and every producer emits
  // a single role, so taking the first is exact rather than lossy here.
  if ('unionOf' in rolePermissionConfig) {
    const roleId = rolePermissionConfig.unionOf[0];

    return isDefined(roleId) ? (rolesPermissions[roleId] ?? {}) : {};
  }

  return {};
};
