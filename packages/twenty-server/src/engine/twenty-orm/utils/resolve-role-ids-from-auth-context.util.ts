import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { applyAgentRoleRestriction } from 'src/engine/core-modules/auth/utils/apply-agent-role-restriction.util';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { resolveAgentRoleId } from 'src/engine/twenty-orm/utils/resolve-agent-role-id.util';
import { resolveOwnRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-own-role-ids-from-auth-context.util';

export const resolveRoleIdsFromAuthContext = (roleMaps: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
}): string[] =>
  applyAgentRoleRestriction({
    roleIds: resolveOwnRoleIdsFromAuthContext(roleMaps),
    agentRoleId: resolveAgentRoleId({
      agentId:
        isUserAuthContext(roleMaps.authContext) ||
        isApplicationAuthContext(roleMaps.authContext)
          ? roleMaps.authContext.agentId
          : undefined,
      flatRoleTargetByAgentIdMaps: roleMaps.flatRoleTargetByAgentIdMaps,
    }),
  });
