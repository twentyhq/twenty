import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';

type ResolveRoleIdsFromAuthContextArgs = {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
};

// The roles the principal acts with; a run-as application is left out since it only narrows them, so its role must
// never count as a principal that records are shared with
export const resolveHeldRoleIdsFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: ResolveRoleIdsFromAuthContextArgs): string[] => {
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

export const resolveRoleIdsFromAuthContext = (
  args: ResolveRoleIdsFromAuthContextArgs,
): string[] => {
  const heldRoleIds = resolveHeldRoleIdsFromAuthContext(args);
  const runAsApplicationRoleId = isUserAuthContext(args.authContext)
    ? args.authContext.viaApplication?.defaultRoleId
    : undefined;

  // An application running as a member must not reach past its own role by picking a more privileged member
  return isNonEmptyArray(heldRoleIds) && isDefined(runAsApplicationRoleId)
    ? [...new Set([...heldRoleIds, runAsApplicationRoleId])]
    : heldRoleIds;
};
