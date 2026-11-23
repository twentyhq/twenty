/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalsLimitingRoleIds = ({
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
}: Pick<
  PermissionsPrincipalsWithRolesContext,
  'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
>): string[] => [
  ...new Set(
    [
      limitingPrincipal?.roleId,
      applicationPrincipal.type === 'customApplication' ||
      !isDefined(applicationPrincipal.roleId) ||
      mainPrincipal.roleIds.includes(applicationPrincipal.roleId)
        ? undefined
        : applicationPrincipal.roleId,
    ].filter(isDefined),
  ),
];
