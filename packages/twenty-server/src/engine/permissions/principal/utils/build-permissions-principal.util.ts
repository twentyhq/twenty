/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';

// Undefined when the caller bypasses permission checks: there is no system principal
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  authContext,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  authContext?: WorkspaceAuthContext;
}): PermissionsPrincipal | undefined => {
  if (!('intersectionOf' in rolePermissionConfig)) {
    return undefined;
  }

  return {
    workspaceId,
    intersectionOf: rolePermissionConfig.intersectionOf,
    workspaceMember:
      isDefined(authContext) && isUserAuthContext(authContext)
        ? authContext.workspaceMember
        : undefined,
  };
};
