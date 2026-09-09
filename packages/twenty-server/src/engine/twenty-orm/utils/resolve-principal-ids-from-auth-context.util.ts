import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

export const resolvePrincipalIdsFromAuthContext = ({
  authContext,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): string[] | undefined => {
  if (isSystemAuthContext(authContext)) {
    return undefined;
  }

  const roleIds = resolveRoleIdsFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

  const principalIds = [
    EVERYONE_PRINCIPAL_ID,
    isUserAuthContext(authContext) ? authContext.workspaceMemberId : undefined,
    ...roleIds,
  ].filter(isDefined);

  return [...new Set(principalIds)];
};
