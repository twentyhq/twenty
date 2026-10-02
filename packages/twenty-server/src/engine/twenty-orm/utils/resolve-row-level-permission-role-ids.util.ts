import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

// An explicit intersection can name roles the auth context does not carry (an agent role), and each of them must bound
// the reachable rows too
export const resolveRowLevelPermissionRoleIds = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
  rolePermissionConfig,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  rolePermissionConfig?: RolePermissionConfig;
}): string[] => {
  const authContextRoleIds = resolveRoleIdsFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

  if (
    !isDefined(rolePermissionConfig) ||
    !('intersectionOf' in rolePermissionConfig)
  ) {
    return authContextRoleIds;
  }

  return [
    ...new Set([...authContextRoleIds, ...rolePermissionConfig.intersectionOf]),
  ];
};
