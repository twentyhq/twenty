import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveHeldRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

const resolveRolePrincipalIds = ({
  rolePermissionConfig,
  ...roleMaps
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  rolePermissionConfig?: RolePermissionConfig;
}): string[] => {
  if (
    !isDefined(rolePermissionConfig) ||
    !('intersectionOf' in rolePermissionConfig)
  ) {
    return resolveHeldRoleIdsFromAuthContext(roleMaps);
  }

  const intersectedRoleIds = [...new Set(rolePermissionConfig.intersectionOf)];

  // A share to one role reaches beyond the other roles of an intersection, so only a lone role keeps its shares
  return intersectedRoleIds.length === 1 ? intersectedRoleIds : [];
};

export const resolvePrincipalIdsFromAuthContext = (args: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  rolePermissionConfig?: RolePermissionConfig;
}): string[] | undefined => {
  const { authContext } = args;

  if (isSystemAuthContext(authContext)) {
    return undefined;
  }

  const principalIds = [
    EVERYONE_PRINCIPAL_ID,
    isUserAuthContext(authContext) ? authContext.workspaceMemberId : undefined,
    ...resolveRolePrincipalIds(args),
  ].filter(isDefined);

  return [...new Set(principalIds)];
};
