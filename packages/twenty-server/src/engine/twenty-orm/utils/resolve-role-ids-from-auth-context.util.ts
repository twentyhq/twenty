import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { applyAgentRoleRestriction } from 'src/engine/core-modules/auth/utils/apply-agent-role-restriction.util';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { resolveOwnRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-own-role-ids-from-auth-context.util';

export const resolveRoleIdsFromAuthContext = (roleMaps: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): string[] =>
  applyAgentRoleRestriction({
    roleIds: resolveOwnRoleIdsFromAuthContext(roleMaps),
    agentRoleRestriction:
      isUserAuthContext(roleMaps.authContext) ||
      isApplicationAuthContext(roleMaps.authContext)
        ? roleMaps.authContext.agentRoleRestriction
        : undefined,
  });
