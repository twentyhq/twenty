/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalRoleIds = (
  principal: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >,
): string[] => [
  ...new Set(
    [
      principal.limitingPrincipal?.roleId,
      principal.mainPrincipal.roleId,
      principal.applicationPrincipal.type === 'customApplication'
        ? undefined
        : principal.applicationPrincipal.roleId,
    ].filter(isDefined),
  ),
];
