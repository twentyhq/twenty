/* @license Enterprise */

import {
  type PermissionsPrincipalsContext,
  type PermissionsPrincipalActors,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

// undefined when the config bypasses permission checks or denies everything
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  actors,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  actors: PermissionsPrincipalActors;
}): PermissionsPrincipalsContext | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  const principalRoles = buildPermissionsPrincipalRoles({
    roleIdsBySource: rolePermissionConfig.intersectionOf,
    actors,
  });

  return principalRoles === undefined
    ? undefined
    : { workspaceId, ...principalRoles };
};
