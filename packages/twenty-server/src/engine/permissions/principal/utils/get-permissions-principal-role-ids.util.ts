/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

// The limiting role comes first: the intersection keeps the first role's row-level predicates
export const getPermissionsPrincipalRoleIds = (
  principal: Omit<PermissionsPrincipal, 'workspaceId'>,
): string[] => {
  const slotRoleIds = [
    principal.limitingRoleId,
    principal.main?.roleId,
    principal.appRoleId,
  ].filter((roleId) => roleId !== undefined);

  if (slotRoleIds.length === 0 || slotRoleIds.includes(null)) {
    return [];
  }

  return [...new Set(slotRoleIds.filter((roleId) => roleId !== null))];
};
