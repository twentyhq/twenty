/* @license Enterprise */

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { getRoleIdsToIntersect } from 'src/engine/permissions/principal/utils/get-role-ids-to-intersect.util';
import { resolvePermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/resolve-permissions-principal-acting-application-id.util';

type BuildRolePermissionsPrincipalArgs = {
  workspaceId: string;
  roleId: string;
  applicationId: string | undefined;
};

type BuildConfigPermissionsPrincipalArgs = {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  workspaceMemberId: string | undefined;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
};

export function buildPermissionsPrincipal(
  args: BuildRolePermissionsPrincipalArgs,
): PermissionsPrincipal;
export function buildPermissionsPrincipal(
  args: BuildConfigPermissionsPrincipalArgs,
): PermissionsPrincipal | undefined;
export function buildPermissionsPrincipal(
  args: BuildRolePermissionsPrincipalArgs | BuildConfigPermissionsPrincipalArgs,
): PermissionsPrincipal | undefined {
  if ('roleId' in args) {
    return {
      workspaceId: args.workspaceId,
      roleIds: [args.roleId],
      applicationId: args.applicationId,
    };
  }

  const { workspaceId, rolePermissionConfig, workspaceMemberId } = args;

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
      flatApplicationMaps: args.flatApplicationMaps,
    }),
  };
}
