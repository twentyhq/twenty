/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

// TODO(@charlesBochet): drop once repositories resolve roles from the principals instead of a RolePermissionConfig
export const buildPermissionsPrincipalsWithRolesFromConfig = ({
  workspaceId,
  rolePermissionConfig,
  principalsContext,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  principalsContext: PermissionsPrincipalsContext | undefined;
}): PermissionsPrincipalsWithRolesContext | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  const principalRoles = buildPermissionsPrincipalRoles({
    roleIdsBySource: rolePermissionConfig.intersectionOf,
    principalsContext,
  });

  if (!isDefined(principalRoles)) {
    return undefined;
  }

  return { workspaceId, ...principalRoles };
};
