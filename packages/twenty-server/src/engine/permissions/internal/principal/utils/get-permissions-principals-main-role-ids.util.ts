/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalsMainRoleIds = ({
  mainPrincipal,
}: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>): string[] => [
  ...new Set([
    mainPrincipal.roleId,
    ...(mainPrincipal.additionalRoleIds ?? []),
  ]),
];
