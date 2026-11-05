/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildRolePermissionsPrincipals = ({
  workspaceId,
  roleId,
}: {
  workspaceId: string;
  roleId: string;
}): PermissionsPrincipalsWithRolesContext => ({
  workspaceId,
  mainPrincipal: { type: 'role', roleId },
  applicationPrincipal: { type: 'customApplication' },
});
