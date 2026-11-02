/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalActors } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export const getPermissionsPrincipalActorsFromIds = ({
  workspaceMemberId,
  apiKeyId,
  applicationId,
  agentId,
}: {
  workspaceMemberId: string | undefined;
  apiKeyId: string | undefined;
  applicationId: string | undefined;
  agentId: string | undefined;
}): PermissionsPrincipalActors => {
  if (isDefined(workspaceMemberId)) {
    return { main: { workspaceMemberId }, agentId, applicationId };
  }

  if (isDefined(apiKeyId)) {
    return { main: { apiKeyId }, agentId, applicationId };
  }

  if (isDefined(applicationId)) {
    return { main: { applicationId }, agentId, applicationId };
  }

  return { main: undefined, agentId, applicationId };
};
