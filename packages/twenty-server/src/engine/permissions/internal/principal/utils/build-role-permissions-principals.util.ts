/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildRolePermissionsPrincipals = ({
  workspaceId,
  roleId,
  systemSideEffectRoleIds = [],
}: {
  workspaceId: string;
  roleId: string;
  systemSideEffectRoleIds?: string[];
}): PermissionsPrincipalsWithRolesContext => ({
  workspaceId,
  mainPrincipal: {
    type: 'role',
    roleId,
    ...(isNonEmptyArray(systemSideEffectRoleIds)
      ? { systemSideEffectRoleIds }
      : {}),
  },
  applicationPrincipal: { type: 'customApplication' },
});
