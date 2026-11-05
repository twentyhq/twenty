/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';

export const arePermissionsPrincipalsRolesCached = ({
  principals,
  rolesPermissions,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  rolesPermissions: PermissionsMetadataMaps['rolesPermissions'];
}) =>
  getPermissionsPrincipalsRoleIds(principals).every((roleId) =>
    isDefined(rolesPermissions[roleId]),
  );
