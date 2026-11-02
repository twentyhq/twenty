/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

// The limiting role comes first: the intersection keeps the first role's row-level predicates
export const getPermissionsPrincipalRoleIds = (
  principal: Pick<
    PermissionsPrincipal,
    'main' | 'limitingRoleId' | 'appRoleId'
  >,
): string[] => {
  const slotRoleIds = [
    principal.limitingRoleId,
    principal.main.roleId,
    principal.appRoleId === WORKSPACE_APP_ROLE_ID
      ? undefined
      : principal.appRoleId,
  ];

  if (slotRoleIds.includes(null)) {
    return [];
  }

  return [...new Set(slotRoleIds.filter(isDefined))];
};
