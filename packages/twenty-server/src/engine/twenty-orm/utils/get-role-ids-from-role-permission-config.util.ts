import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

// No config, bypass and deny all yield no role ids: never read an empty list as "no restriction"
export const getRoleIdsFromRolePermissionConfig = (
  rolePermissionConfig: RolePermissionConfig | undefined,
): string[] =>
  !isDefined(rolePermissionConfig) ||
  'shouldBypassPermissionChecks' in rolePermissionConfig
    ? []
    : (getRoleIdsToIntersect(rolePermissionConfig.intersectionOf) ?? []);
