/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsMainPrincipal,
  type PermissionsPrincipalsContext,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';

const buildMainPrincipal = ({
  workspaceMemberId,
  apiKeyId,
  applicationId,
}: {
  workspaceMemberId: string | undefined;
  apiKeyId: string | undefined;
  applicationId: string | undefined;
}): PermissionsMainPrincipal | undefined => {
  if (isDefined(workspaceMemberId)) {
    return { workspaceMemberId };
  }

  if (isDefined(apiKeyId)) {
    return { apiKeyId };
  }

  if (isDefined(applicationId)) {
    return { applicationId };
  }

  return undefined;
};

export const buildPermissionsPrincipalsContext = ({
  workspaceId,
  workspaceMemberId,
  apiKeyId,
  applicationId,
  agentId,
}: {
  workspaceId: string;
  workspaceMemberId: string | undefined;
  apiKeyId: string | undefined;
  applicationId: string | undefined;
  agentId: string | undefined;
}): PermissionsPrincipalsContext | undefined => {
  const mainPrincipal = buildMainPrincipal({
    workspaceMemberId,
    apiKeyId,
    applicationId,
  });

  if (!isDefined(mainPrincipal)) {
    return undefined;
  }

  return {
    workspaceId,
    mainPrincipal,
    limitingPrincipal: isDefined(agentId) ? { agentId } : undefined,
    applicationPrincipal: isDefined(applicationId)
      ? { applicationId }
      : { isCustomApp: true },
  };
};
