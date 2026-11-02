import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  type RolePermissionConfig,
  type RoleIdsBySource,
} from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildAgentRoleIdsBySource } from 'src/engine/permissions/principal/utils/build-agent-role-ids-by-source.util';
import { buildUserRoleIdsBySource } from 'src/engine/permissions/principal/utils/build-user-role-ids-by-source.util';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';
import { isDenyingRoleIdsBySource } from 'src/engine/permissions/principal/utils/is-denying-role-ids-by-source.util';

const resolveUserAndApplicationRoleIds = ({
  authContext,
  userRoleId,
}: {
  authContext: UserWorkspaceAuthContext;
  userRoleId: string | undefined;
}): RoleIdsBySource => {
  if (isDefined(authContext.application)) {
    return buildUserRoleIdsBySource({
      userRoleId,
      application: authContext.application,
    });
  }

  return {
    userWorkspaceRoleId: userRoleId ?? null,
    ...resolveApplicationRoleId({ application: authContext.viaApplication }),
  };
};

export const resolveRoleIdsBySourceFromAuthContext = ({
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
      ...resolveUserAndApplicationRoleIds({
        authContext,
        userRoleId: userWorkspaceRoleMap[authContext.userWorkspaceId],
      }),
      ...buildAgentRoleIdsBySource({
        agentId: authContext.agentId,
        flatRoleTargetByAgentIdMaps,
      }),
    };
  }

  if (isApiKeyAuthContext(authContext)) {
    return {
      apiKeyRoleId: apiKeyRoleMap[authContext.apiKey.id] ?? null,
      ...resolveApplicationRoleId({ application: authContext.viaApplication }),
      ...buildAgentRoleIdsBySource({
        agentId: authContext.agentId,
        flatRoleTargetByAgentIdMaps,
      }),
    };
  }

  if (isApplicationAuthContext(authContext)) {
    return {
      applicationRoleId: authContext.application.defaultRoleId ?? null,
      ...buildAgentRoleIdsBySource({
        agentId: authContext.agentId,
        flatRoleTargetByAgentIdMaps,
      }),
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
