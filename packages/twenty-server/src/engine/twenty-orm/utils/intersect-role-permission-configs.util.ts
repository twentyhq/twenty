import { isDefined } from 'twenty-shared/utils';

import {
  type RoleIdsBySource,
  type RolePermissionConfig,
} from 'src/engine/twenty-orm/types/role-permission-config.type';

// Two different roles from one source cannot be expressed as one intersection, so that source grants nothing
export const intersectRolePermissionConfigs = (
  outer: RolePermissionConfig | undefined,
  inner: RolePermissionConfig | undefined,
): RolePermissionConfig | undefined => {
  if (!isDefined(outer) || 'shouldBypassPermissionChecks' in outer) {
    return inner ?? outer;
  }

  if (!isDefined(inner) || 'shouldBypassPermissionChecks' in inner) {
    return outer;
  }

  const intersectionOf: RoleIdsBySource = { ...outer.intersectionOf };

  for (const [source, roleId] of Object.entries(inner.intersectionOf) as [
    keyof RoleIdsBySource,
    string | null | undefined,
  ][]) {
    if (roleId === undefined) {
      continue;
    }

    const outerRoleId = intersectionOf[source];

    intersectionOf[source] =
      outerRoleId === undefined || outerRoleId === roleId ? roleId : null;
  }

  return { intersectionOf };
};
