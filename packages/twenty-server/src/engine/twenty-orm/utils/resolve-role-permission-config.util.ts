import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  type RolePermissionConfig,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';
import { buildAgentRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-agent-role-ids-by-source.util';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';
import { resolveAgentRoleId } from 'src/engine/twenty-orm/utils/resolve-agent-role-id.util';
import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';

const resolveRoleIdsBySourceFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
  flatRoleTargetByAgentIdMaps,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
}): RoleIdsBySource => {
  if (isUserAuthContext(authContext)) {
    return {
      ...buildUserRoleIdsBySource({
        userRoleId: userWorkspaceRoleMap[authContext.userWorkspaceId],
        application: authContext.application,
      }),
      ...buildAgentRoleIdsBySource(
        resolveAgentRoleId({
          agentId: authContext.agentId,
          flatRoleTargetByAgentIdMaps,
        }),
      ),
    };
  }

  if (isApiKeyAuthContext(authContext)) {
    return { apiKeyRoleId: apiKeyRoleMap[authContext.apiKey.id] ?? null };
  }

  if (isApplicationAuthContext(authContext)) {
    return {
      ...resolveApplicationRoleId({
        application: authContext.application,
        isMissingApplicationRoleTolerated: false,
      }),
      ...buildAgentRoleIdsBySource(
        resolveAgentRoleId({
          agentId: authContext.agentId,
          flatRoleTargetByAgentIdMaps,
        }),
      ),
    };
  }

  return {};
};

// null when the context allows nothing, which each caller turns into its own denial
export const resolveRolePermissionConfig = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
  flatRoleTargetByAgentIdMaps,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
}): RolePermissionConfig | null => {
  if (isSystemAuthContext(authContext)) {
    return { shouldBypassPermissionChecks: true };
  }

  const roleIdsBySource = resolveRoleIdsBySourceFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
    flatRoleTargetByAgentIdMaps,
  });

  return isDenyingRoleIdsBySource(roleIdsBySource)
    ? null
    : { intersectionOf: roleIdsBySource };
};
