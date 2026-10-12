import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  type RolePermissionConfig,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';
import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

const resolveRoleIdsBySourceFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): RoleIdsBySource => {
  if (isUserAuthContext(authContext)) {
    return buildUserRoleIdsBySource({
      userRoleId: userWorkspaceRoleMap[authContext.userWorkspaceId],
      application: authContext.application,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return { apiKeyRoleId: apiKeyRoleMap[authContext.apiKey.id] ?? null };
  }

  if (isApplicationAuthContext(authContext)) {
    return resolveApplicationRoleId({
      application: authContext.application,
      isMissingApplicationRoleTolerated: false,
    });
  }

  return {};
};

// null when the context allows nothing, which each caller turns into its own denial
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

  const runRoleIds = resolveRoleIdsBySourceFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

  return isDefined(getRoleIdsToIntersect(runRoleIds))
    ? { intersectionOf: runRoleIds }
    : null;
};
