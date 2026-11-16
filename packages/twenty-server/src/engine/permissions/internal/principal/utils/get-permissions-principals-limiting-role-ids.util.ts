/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

// an application acting with the assigned role (itself as main, or OAuth-only) adds no limit of its own.
// One that only matches a system side effect role still limits: the member holds more than that role
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
      applicationPrincipal.roleId === mainPrincipal.roleId
        ? undefined
        : applicationPrincipal.roleId,
    ].filter(isDefined),
  ),
];
