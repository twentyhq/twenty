import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

// Bypass and deny both yield no role ids: never read an empty list as "no restriction"
export const getRoleIdsFromRolePermissionConfig = (
  rolePermissionConfig: RolePermissionConfig,
): string[] =>
  'shouldBypassPermissionChecks' in rolePermissionConfig
    ? []
    : (getRoleIdsToIntersect(rolePermissionConfig.intersectionOf) ?? []);
