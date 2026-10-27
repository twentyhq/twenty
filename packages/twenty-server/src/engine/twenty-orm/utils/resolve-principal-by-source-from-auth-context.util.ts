import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PrincipalBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const resolvePrincipalBySourceFromAuthContext = (
  authContext: WorkspaceAuthContext,
): PrincipalBySource => {
  if (isApiKeyAuthContext(authContext)) {
    return {
      apiKeyRoleId: { type: 'apiKey', apiKeyId: authContext.apiKey.id },
    };
  }

  if (
    !isUserAuthContext(authContext) &&
    !isApplicationAuthContext(authContext)
  ) {
    return {};
  }

  return {
    ...(isUserAuthContext(authContext)
      ? {
          userWorkspaceRoleId: {
            type: 'userWorkspace',
            userWorkspaceId: authContext.userWorkspaceId,
          },
        }
      : {}),
    ...(isDefined(authContext.application)
      ? {
          applicationRoleId: {
            type: 'application',
            applicationId: authContext.application.id,
          },
        }
      : {}),
    ...(isDefined(authContext.agentId)
      ? { agentRoleId: { type: 'agent', agentId: authContext.agentId } }
      : {}),
  };
};
