/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildRolePermissionsPrincipals = ({
  workspaceId,
  roleId,
  additionalRoleIds = [],
}: {
  workspaceId: string;
  roleId: string;
  additionalRoleIds?: string[];
}): PermissionsPrincipalsWithRolesContext => ({
  workspaceId,
  mainPrincipal: {
    type: 'role',
    roleId,
    ...(additionalRoleIds.length > 0 ? { additionalRoleIds } : {}),
  },
  applicationPrincipal: { type: 'customApplication' },
});
