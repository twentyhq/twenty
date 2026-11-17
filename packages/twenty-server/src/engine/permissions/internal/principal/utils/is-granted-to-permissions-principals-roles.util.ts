/* @license Enterprise */

import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const isGrantedToPermissionsPrincipalsRoles = ({
  principals,
  isGrantedToRole,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
  isGrantedToRole: (roleId: string) => boolean;
}): boolean =>
  principals.mainPrincipal.roleIds.some(isGrantedToRole) &&
  getPermissionsPrincipalsLimitingRoleIds(principals).every(isGrantedToRole);
