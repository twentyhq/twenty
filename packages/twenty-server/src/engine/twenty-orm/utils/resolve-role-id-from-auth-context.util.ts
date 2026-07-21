import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';

export const resolveRoleIdFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): string | undefined => {
  if (isUserAuthContext(authContext)) {
    return userWorkspaceRoleMap[authContext.userWorkspaceId];
  }

  if (isApiKeyAuthContext(authContext)) {
    return apiKeyRoleMap[authContext.apiKey.id];
  }

  if (
    isApplicationAuthContext(authContext) &&
    isDefined(authContext.application.defaultRoleId)
  ) {
    return authContext.application.defaultRoleId;
  }

  return undefined;
};
