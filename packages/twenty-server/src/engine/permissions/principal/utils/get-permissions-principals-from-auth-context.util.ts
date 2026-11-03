/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipalsContext } from 'src/engine/permissions/principal/utils/build-permissions-principals-context.util';

const getIdentityPrincipalsFromAuthContext = (
  authContext: WorkspaceAuthContext,
): PermissionsPrincipalsContext | undefined => {
  if (isUserAuthContext(authContext)) {
    return buildPermissionsPrincipalsContext({
      workspaceId: authContext.workspace.id,
      workspaceMemberId: authContext.workspaceMemberId,
      apiKeyId: undefined,
      applicationId: authContext.application?.id,
      agentId: authContext.agentId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return buildPermissionsPrincipalsContext({
      workspaceId: authContext.workspace.id,
      workspaceMemberId: undefined,
      apiKeyId: authContext.apiKey.id,
      applicationId: authContext.application?.id,
      agentId: authContext.agentId,
    });
  }

  if (isApplicationAuthContext(authContext)) {
    return buildPermissionsPrincipalsContext({
      workspaceId: authContext.workspace.id,
      workspaceMemberId: undefined,
      apiKeyId: undefined,
      applicationId: authContext.application.id,
      agentId: authContext.agentId,
    });
  }

  return undefined;
};

export const getPermissionsPrincipalsFromAuthContext = (
  authContext: WorkspaceAuthContext,
): PermissionsPrincipalsContext | undefined => {
  const principalsContext = getIdentityPrincipalsFromAuthContext(authContext);

  if (
    !isDefined(principalsContext) ||
    !('permissionScope' in authContext) ||
    !isDefined(authContext.permissionScope)
  ) {
    return principalsContext;
  }

  return { ...principalsContext, scope: authContext.permissionScope };
};
