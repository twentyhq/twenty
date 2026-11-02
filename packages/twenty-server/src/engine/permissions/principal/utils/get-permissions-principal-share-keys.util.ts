/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';
import { getPermissionsPrincipalWorkspaceMemberId } from 'src/engine/permissions/principal/utils/get-permissions-principal-workspace-member-id.util';

export const getPermissionsPrincipalShareKeys = (
  principal: PermissionsPrincipal,
): string[] => [
  ...new Set(
    [
      getPermissionsPrincipalWorkspaceMemberId(principal),
      ...getPermissionsPrincipalRoleIds(principal),
    ].filter(isDefined),
  ),
];
