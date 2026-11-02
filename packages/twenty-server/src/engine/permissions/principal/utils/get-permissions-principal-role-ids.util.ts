/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

// The limiting role comes first: the intersection keeps the first role's row-level predicates
export const getPermissionsPrincipalRoleIds = (
  principal: Pick<
    PermissionsPrincipalsContext,
    'mainPrincipal' | 'limiting' | 'app'
  >,
): string[] => [
  ...new Set(
    [
      principal.limiting?.roleId,
      principal.mainPrincipal.roleId,
      'roleId' in principal.app ? principal.app.roleId : undefined,
    ].filter(isDefined),
  ),
];
