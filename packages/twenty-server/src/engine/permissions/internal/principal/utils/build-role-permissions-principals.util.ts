/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildRolePermissionsPrincipals = ({
  workspaceId,
  roleId,
  roleIds = [],
}: {
  workspaceId: string;
  roleId: string;
  roleIds?: string[];
}): PermissionsPrincipalsWithRolesContext => ({
  workspaceId,
  mainPrincipal: {
    type: 'role',
    roleId,
    ...(isNonEmptyArray(roleIds) ? { roleIds } : {}),
  },
  applicationPrincipal: { type: 'customApplication' },
});
