/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsPrincipalsContext,
  type PermissionsPrincipals,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

// undefined when the config bypasses permission checks or denies everything
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  principals,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  principals: PermissionsPrincipals;
}): PermissionsPrincipalsContext | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  const principalRoles = buildPermissionsPrincipalRoles({
    roleIdsBySource: rolePermissionConfig.intersectionOf,
    principals,
  });

  if (!isDefined(principalRoles)) {
    return undefined;
  }

  return { workspaceId, ...principalRoles };
};
