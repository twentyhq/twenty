/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

// TODO(@charlesBochet): drop once callers without an acting principal pass one instead of bare role ids
export const buildDeprecatedPermissionsPrincipalsFromConfig = ({
  workspaceId,
  rolePermissionConfig,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
}): PermissionsPrincipalsContext | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  const principalRoles = buildPermissionsPrincipalRoles({
    roleIdsBySource: rolePermissionConfig.intersectionOf,
    principalsContext: undefined,
  });

  if (!isDefined(principalRoles)) {
    return undefined;
  }

  const { mainPrincipal, limitingPrincipal, applicationPrincipal } =
    principalRoles;

  return {
    workspaceId,
    mainPrincipal: { type: 'deprecatedRoleOnly', roleId: mainPrincipal.roleId },
    limitingPrincipal: isDefined(limitingPrincipal)
      ? { type: 'deprecatedRoleOnly', roleId: limitingPrincipal.roleId }
      : undefined,
    applicationPrincipal:
      applicationPrincipal.type === 'customApplication'
        ? applicationPrincipal
        : { type: 'deprecatedRoleOnly', roleId: applicationPrincipal.roleId },
  };
};
