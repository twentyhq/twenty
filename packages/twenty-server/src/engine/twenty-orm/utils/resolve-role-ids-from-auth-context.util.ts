import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';

export const resolveRoleIdsFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): string[] => {
  if (isUserAuthContext(authContext)) {
    return resolveRoleIdsForUser({
      userRoleId: userWorkspaceRoleMap[authContext.userWorkspaceId],
      applicationRoleId: authContext.application?.defaultRoleId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    const apiKeyRoleId = apiKeyRoleMap[authContext.apiKey.id];

    return isDefined(apiKeyRoleId) ? [apiKeyRoleId] : [];
  }

  if (isApplicationAuthContext(authContext)) {
    const applicationRoleId = authContext.application.defaultRoleId;

    return isDefined(applicationRoleId) ? [applicationRoleId] : [];
  }

  return [];
};
