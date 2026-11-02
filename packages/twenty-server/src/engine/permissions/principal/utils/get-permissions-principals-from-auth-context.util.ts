/* @license Enterprise */

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipalsContext } from 'src/engine/permissions/principal/utils/build-permissions-principals-context.util';

// TODO(@charlesBochet): agent runs do not always carry their agent yet, so their row-level checks can miss its role
export const getPermissionsPrincipalsFromAuthContext = (
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
      applicationId: undefined,
      agentId: undefined,
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
