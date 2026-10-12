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

const isEmptyIntersection = (roleIdsBySource: RoleIdsBySource): boolean =>
  Object.values(roleIdsBySource).every((roleId) => roleId === undefined);

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

  // An empty intersection denies, so it must stay empty whatever the other side holds
  if (isEmptyIntersection(left.intersectionOf)) {
    return left;
  }

  if (isEmptyIntersection(right.intersectionOf)) {
    return right;
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
