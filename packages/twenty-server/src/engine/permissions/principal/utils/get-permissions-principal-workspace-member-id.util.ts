/* @license Enterprise */

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export const getPermissionsPrincipalWorkspaceMemberId = (
  principal: Pick<PermissionsPrincipalsContext, 'mainPrincipal'>,
): string | undefined =>
  'workspaceMemberId' in principal.mainPrincipal
    ? principal.mainPrincipal.workspaceMemberId
    : undefined;
