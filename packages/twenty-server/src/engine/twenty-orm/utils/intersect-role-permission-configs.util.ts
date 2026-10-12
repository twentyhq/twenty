import { isDefined } from 'twenty-shared/utils';

import {
  type RolePermissionConfig,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';

const intersectRoleIds = (
  left: string | null | undefined,
  right: string | null | undefined,
): string | null | undefined => {
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
    const roleId = intersectRoleIds(
      left.intersectionOf[source],
      right.intersectionOf[source],
    );

    if (roleId !== undefined) {
      intersectionOf[source] = roleId;
    }
  }

  return { intersectionOf };
};
