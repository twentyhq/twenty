/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalsLimitingRoleIds = ({
  limitingPrincipal,
  applicationPrincipal,
}: Pick<
  PermissionsPrincipalsWithRolesContext,
  'limitingPrincipal' | 'applicationPrincipal'
>): string[] => [
  ...new Set(
    [
      limitingPrincipal?.roleId,
      applicationPrincipal.type === 'customApplication'
        ? undefined
        : applicationPrincipal.roleId,
    ].filter(isDefined),
  ),
];
