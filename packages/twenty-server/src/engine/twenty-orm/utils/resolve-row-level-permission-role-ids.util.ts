import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

// Row-level predicates hang off a role, and the auth context only names the
// caller's own roles. A role that bounds the caller through an intersection
// (an agent's role capping a run-as member) must contribute its filter too,
// or it would cap objects and fields but not rows.
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

  const boundingRoleIds =
    isDefined(rolePermissionConfig) && 'intersectionOf' in rolePermissionConfig
      ? rolePermissionConfig.intersectionOf
      : [];

  return [...new Set([...authContextRoleIds, ...boundingRoleIds])];
};
