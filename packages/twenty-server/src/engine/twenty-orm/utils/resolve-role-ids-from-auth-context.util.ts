import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';

// A request can carry more than one principal. An application acting on a
// user's behalf must stay within that person's role and within the role it
// declared, so both are returned and permissions are the intersection of them.
// An application that declares no role contributes nothing, which is no extra
// bound rather than a denial.
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
    const userRoleId = userWorkspaceRoleMap[authContext.userWorkspaceId];

    // A user with no role resolves to nothing at all, as it did before an
    // application could ride along. The application's role must never stand in
    // for a missing user role, or it would grant more than the user has.
    if (!isDefined(userRoleId)) {
      return [];
    }

    const applicationRoleId = authContext.application?.defaultRoleId;

    return isDefined(applicationRoleId)
      ? [userRoleId, applicationRoleId]
      : [userRoleId];
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
