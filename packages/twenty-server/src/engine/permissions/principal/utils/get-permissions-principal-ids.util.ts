/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionsPrincipalIds } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipalIds } from 'src/engine/permissions/principal/utils/build-permissions-principal-ids.util';

const NO_PRINCIPAL_IDS = {
  workspaceMemberId: undefined,
  apiKeyId: undefined,
  applicationId: undefined,
  agentId: undefined,
};

export const getPermissionsPrincipalIds = (
  authContext: WorkspaceAuthContext | undefined,
): PermissionsPrincipalIds => {
  if (!isDefined(authContext)) {
    return buildPermissionsPrincipalIds(NO_PRINCIPAL_IDS);
  }

  if (isUserAuthContext(authContext)) {
    return buildPermissionsPrincipalIds({
      ...NO_PRINCIPAL_IDS,
      workspaceMemberId: authContext.workspaceMemberId,
      applicationId: (authContext.application ?? authContext.viaApplication)
        ?.id,
      agentId: authContext.agentId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return buildPermissionsPrincipalIds({
      ...NO_PRINCIPAL_IDS,
      apiKeyId: authContext.apiKey.id,
    });
  }

  if (isApplicationAuthContext(authContext)) {
    return buildPermissionsPrincipalIds({
      ...NO_PRINCIPAL_IDS,
      applicationId: authContext.application.id,
      agentId: authContext.agentId,
    });
  }

  return buildPermissionsPrincipalIds(NO_PRINCIPAL_IDS);
};
