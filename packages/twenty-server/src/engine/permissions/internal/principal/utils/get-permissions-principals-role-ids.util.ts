/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalsRoleIds = (
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >,
): string[] => [
  ...new Set(
    [
      principals.limitingPrincipal?.roleId,
      principals.mainPrincipal.roleId,
      principals.applicationPrincipal.type === 'customApplication'
        ? undefined
        : principals.applicationPrincipal.roleId,
    ].filter(isDefined),
  ),
];
