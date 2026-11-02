/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RepositoryPermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';
import {
  type PermissionsPrincipalRoleMaps,
  resolvePermissionsPrincipalsWithRoles,
} from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';

// TODO(@charlesBochet): drop intersectionOf once every caller passes principals
export const buildPermissionsPrincipalsWithRolesFromConfig = ({
  workspaceId,
  rolePermissionConfig,
  principalsContext,
  roleMaps,
}: {
  workspaceId: string;
  rolePermissionConfig: RepositoryPermissionConfig;
  principalsContext: PermissionsPrincipalsContext | undefined;
  roleMaps: PermissionsPrincipalRoleMaps;
}): PermissionsPrincipalsWithRolesContext | undefined => {
  if ('principals' in rolePermissionConfig) {
    return resolvePermissionsPrincipalsWithRoles({
      principalsContext: rolePermissionConfig.principals,
      roleMaps,
    });
  }

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
