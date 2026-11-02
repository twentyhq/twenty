import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';

export const isRestrictedByPermissionScope = (
  rolePermissionConfig: RolePermissionConfig | undefined,
): boolean =>
  isDefined(rolePermissionConfig) &&
  'intersectionOf' in rolePermissionConfig &&
  isDefined(rolePermissionConfig.scope);
