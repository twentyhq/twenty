/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

export const getPermissionsPrincipalShareKeys = (
  principal: PermissionsPrincipal,
): string[] => [
  ...new Set(
    [principal.workspaceMemberId, ...principal.roleIds].filter(isDefined),
  ),
];
