/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalActors } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { getPermissionsPrincipalActorsFromIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-actors-from-ids.util';

const NO_ACTOR_IDS = {
  workspaceMemberId: undefined,
  apiKeyId: undefined,
  applicationId: undefined,
  agentId: undefined,
};

export const getPermissionsPrincipalActors = (
  authContext: WorkspaceAuthContext | undefined,
): PermissionsPrincipalActors => {
  if (!isDefined(authContext)) {
    return getPermissionsPrincipalActorsFromIds(NO_ACTOR_IDS);
  }

  if (isUserAuthContext(authContext)) {
    return getPermissionsPrincipalActorsFromIds({
      ...NO_ACTOR_IDS,
      workspaceMemberId: authContext.workspaceMemberId,
      applicationId: (authContext.application ?? authContext.viaApplication)
        ?.id,
      agentId: authContext.agentId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return getPermissionsPrincipalActorsFromIds({
      ...NO_ACTOR_IDS,
      apiKeyId: authContext.apiKey.id,
    });
  }

  if (isApplicationAuthContext(authContext)) {
    return getPermissionsPrincipalActorsFromIds({
      ...NO_ACTOR_IDS,
      applicationId: authContext.application.id,
      agentId: authContext.agentId,
    });
  }

  return getPermissionsPrincipalActorsFromIds(NO_ACTOR_IDS);
};
