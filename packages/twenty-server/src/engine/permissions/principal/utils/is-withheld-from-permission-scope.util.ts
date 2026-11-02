import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { isRestrictedByPermissionScope } from 'src/engine/permissions/principal/utils/is-restricted-by-permission-scope.util';

// a tool that does not authorize with the config it is given could act beyond a scope, so scoped callers never get it
export const isWithheldFromPermissionScope = ({
  canRunUnderScope,
  rolePermissionConfig,
}: {
  canRunUnderScope: boolean;
  rolePermissionConfig: RolePermissionConfig | undefined;
}): boolean =>
  !canRunUnderScope && isRestrictedByPermissionScope(rolePermissionConfig);
