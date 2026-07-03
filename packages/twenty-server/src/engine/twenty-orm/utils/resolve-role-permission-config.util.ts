import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { resolveRoleIdFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-id-from-auth-context.util';

export const resolveRolePermissionConfig = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): RolePermissionConfig | null => {
  if (isSystemAuthContext(authContext)) {
    return { shouldBypassPermissionChecks: true };
  }

  const roleId = resolveRoleIdFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

  if (!isDefined(roleId)) {
    return null;
  }

  return { intersectionOf: [roleId] };
};
