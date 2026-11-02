/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalIds } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export const buildPermissionsPrincipalIds = ({
  workspaceMemberId,
  apiKeyId,
  applicationId,
  agentId,
}: {
  workspaceMemberId: string | undefined;
  apiKeyId: string | undefined;
  applicationId: string | undefined;
  agentId: string | undefined;
}): PermissionsPrincipalIds => {
  if (isDefined(workspaceMemberId)) {
    return { mainPrincipal: { workspaceMemberId }, agentId, applicationId };
  }

  if (isDefined(apiKeyId)) {
    return { mainPrincipal: { apiKeyId }, agentId, applicationId };
  }

  if (isDefined(applicationId)) {
    return { mainPrincipal: { applicationId }, agentId, applicationId };
  }

  return { mainPrincipal: undefined, agentId, applicationId };
};
