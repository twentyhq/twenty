import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

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

  if (isApiKeyAuthContext(authContext)) {
    const roleId = apiKeyRoleMap[authContext.apiKey.id];

    if (!isDefined(roleId)) {
      return null;
    }

    return { intersectionOf: [roleId] };
  }

  if (
    isApplicationAuthContext(authContext) &&
    isDefined(authContext.application.defaultRoleId)
  ) {
    return { intersectionOf: [authContext.application.defaultRoleId] };
  }

  if (isUserAuthContext(authContext)) {
    const roleId = userWorkspaceRoleMap[authContext.userWorkspaceId];

    if (!isDefined(roleId)) {
      return null;
    }

    return { intersectionOf: [roleId] };
  }

  return null;
};
