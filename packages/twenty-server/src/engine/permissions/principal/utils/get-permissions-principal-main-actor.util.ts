/* @license Enterprise */

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalMainActor } from 'src/engine/permissions/principal/types/permissions-principal.type';

export const getPermissionsPrincipalMainActor = (
  authContext: WorkspaceAuthContext,
): PermissionsPrincipalMainActor | undefined => {
  if (isUserAuthContext(authContext)) {
    return { workspaceMemberId: authContext.workspaceMemberId };
  }

  if (isApiKeyAuthContext(authContext)) {
    return { apiKeyId: authContext.apiKey.id };
  }

  if (isApplicationAuthContext(authContext)) {
    return { applicationId: authContext.application.id };
  }

  return undefined;
};
