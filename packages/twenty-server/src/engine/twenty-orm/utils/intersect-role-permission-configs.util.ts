import { isDefined } from 'twenty-shared/utils';

import {
  type RolePermissionConfig,
  type RoleRestriction,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';

const intersectRoleRestrictions = (
  left: RoleRestriction | undefined,
  right: RoleRestriction | undefined,
): RoleRestriction | undefined => {
  if (left === undefined) {
    return right;
  }

  if (right === undefined) {
    return left;
  }

  return left === right ? left : null;
};

export const intersectRolePermissionConfigs = (
  left: RolePermissionConfig | undefined,
  right: RolePermissionConfig | undefined,
): RolePermissionConfig | undefined => {
  if (!isDefined(left) || 'shouldBypassPermissionChecks' in left) {
    return right ?? left;
  }

  if (!isDefined(right) || 'shouldBypassPermissionChecks' in right) {
    return left;
  }

  const sources = new Set([
    ...Object.keys(left.intersectionOf),
    ...Object.keys(right.intersectionOf),
  ]) as Set<keyof RoleIdsBySource>;

  const intersectionOf: RoleIdsBySource = {};

  for (const source of sources) {
    const roleRestriction = intersectRoleRestrictions(
      left.intersectionOf[source],
      right.intersectionOf[source],
    );

    if (roleRestriction !== undefined) {
      intersectionOf[source] = roleRestriction;
    }
  }

  return { intersectionOf };
};
