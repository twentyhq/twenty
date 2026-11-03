/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsWorkspaceMemberId } from 'src/engine/permissions/principal/utils/get-permissions-principals-workspace-member-id.util';

export const getPermissionsPrincipalsShareKeys = (
  principals: PermissionsPrincipalsWithRolesContext,
): string[] => [
  ...new Set(
    [
      getPermissionsPrincipalsWorkspaceMemberId(principals),
      ...getPermissionsPrincipalsRoleIds(principals),
    ].filter(isDefined),
  ),
];
