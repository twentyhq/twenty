/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalActors } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

const NO_PERMISSIONS_PRINCIPAL_ACTORS: PermissionsPrincipalActors = {
  main: undefined,
  agentId: undefined,
  applicationId: undefined,
};

export const getPermissionsPrincipalActors = (
  authContext: WorkspaceAuthContext | undefined,
): PermissionsPrincipalActors => {
  if (!isDefined(authContext)) {
    return NO_PERMISSIONS_PRINCIPAL_ACTORS;
  }

  if (isUserAuthContext(authContext)) {
    return {
      main: { workspaceMemberId: authContext.workspaceMemberId },
      agentId: authContext.agentId,
      applicationId: (authContext.application ?? authContext.viaApplication)
        ?.id,
    };
  }

  if (isApiKeyAuthContext(authContext)) {
    return {
      main: { apiKeyId: authContext.apiKey.id },
      agentId: undefined,
      applicationId: undefined,
    };
  }

  if (isApplicationAuthContext(authContext)) {
    return {
      main: { applicationId: authContext.application.id },
      agentId: authContext.agentId,
      applicationId: authContext.application.id,
    };
  }

  return NO_PERMISSIONS_PRINCIPAL_ACTORS;
};
