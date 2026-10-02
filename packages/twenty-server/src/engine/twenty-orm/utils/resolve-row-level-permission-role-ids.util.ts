import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

// An explicit intersection names every role that bounds the reachable rows; the auth context then only tells who the
// member is, since its own roles could carry predicates or all-records access the intersection does not grant
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
  if (
    isDefined(rolePermissionConfig) &&
    'intersectionOf' in rolePermissionConfig
  ) {
    return [...new Set(rolePermissionConfig.intersectionOf)];
  }

  return resolveRoleIdsFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });
};
