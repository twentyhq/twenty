/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

export const getPermissionsPrincipalsShareKeys = (
  principals: PermissionsPrincipalsWithRolesContext,
): string[] => [
  ...new Set(
    [
      isPermissionMainPrincipalWorkspaceMember(principals.mainPrincipal)
        ? principals.mainPrincipal.workspaceMemberId
        : undefined,
      ...getPermissionsPrincipalsRoleIds(principals),
    ].filter(isDefined),
  ),
];
