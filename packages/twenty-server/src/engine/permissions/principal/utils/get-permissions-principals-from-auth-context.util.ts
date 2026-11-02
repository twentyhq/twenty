/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipals } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipals } from 'src/engine/permissions/principal/utils/build-permissions-principals.util';

const NO_PRINCIPALS = {
  workspaceMemberId: undefined,
  apiKeyId: undefined,
  applicationId: undefined,
  agentId: undefined,
};

export const getPermissionsPrincipalsFromAuthContext = (
  authContext: WorkspaceAuthContext | undefined,
): PermissionsPrincipals => {
  if (!isDefined(authContext)) {
    return buildPermissionsPrincipals(NO_PRINCIPALS);
  }

  if (isUserAuthContext(authContext)) {
    return buildPermissionsPrincipals({
      ...NO_PRINCIPALS,
      workspaceMemberId: authContext.workspaceMemberId,
      applicationId: (authContext.application ?? authContext.viaApplication)
        ?.id,
      agentId: authContext.agentId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return buildPermissionsPrincipals({
      ...NO_PRINCIPALS,
      apiKeyId: authContext.apiKey.id,
    });
  }

  if (isApplicationAuthContext(authContext)) {
    return buildPermissionsPrincipals({
      ...NO_PRINCIPALS,
      applicationId: authContext.application.id,
      agentId: authContext.agentId,
    });
  }

  return buildPermissionsPrincipals(NO_PRINCIPALS);
};
