/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';

// An agent acting for someone only narrows their access, so a record shared with its role stays hidden
export const getPermissionsPrincipalShareKeys = (
  principal: PermissionsPrincipal,
): string[] => {
  const { agentRoleId, ...otherRoleIdsBySource } = principal.intersectionOf;
  const otherRoleIds = Object.values(otherRoleIdsBySource);
  const isAgentNarrowing = otherRoleIds.some(isDefined);

  return [
    ...new Set(
      [
        principal.workspaceMember?.id,
        ...getPermissionsPrincipalRoleIds(principal).filter(
          (roleId) =>
            !isAgentNarrowing ||
            roleId !== agentRoleId ||
            otherRoleIds.includes(roleId),
        ),
      ].filter(isDefined),
    ),
  ];
};
