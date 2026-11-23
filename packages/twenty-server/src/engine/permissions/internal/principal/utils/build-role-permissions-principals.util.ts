/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildRolePermissionsPrincipals = ({
  workspaceId,
  roleIds,
}: {
  workspaceId: string;
  roleIds: string[];
}): PermissionsPrincipalsWithRolesContext => ({
  workspaceId,
  mainPrincipal: { type: 'role', roleIds },
  applicationPrincipal: { type: 'customApplication' },
});
