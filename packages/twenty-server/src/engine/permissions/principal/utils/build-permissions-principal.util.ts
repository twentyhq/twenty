/* @license Enterprise */

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { getRoleIdsToIntersect } from 'src/engine/permissions/principal/utils/get-role-ids-to-intersect.util';
import { resolvePermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/resolve-permissions-principal-acting-application-id.util';

// Undefined when the caller bypasses permission checks: there is no system principal
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  workspaceMemberId,
  flatApplicationMaps,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  workspaceMemberId?: string;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): PermissionsPrincipal | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  const { intersectionOf } = rolePermissionConfig;

  return {
    workspaceId,
    roleIds: getRoleIdsToIntersect(intersectionOf) ?? [],
    workspaceMemberId,
    applicationId: resolvePermissionsPrincipalActingApplicationId({
      intersectionOf,
      flatApplicationMaps,
    }),
  };
};
