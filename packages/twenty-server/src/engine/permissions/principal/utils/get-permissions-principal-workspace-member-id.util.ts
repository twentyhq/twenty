/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

export const getPermissionsPrincipalWorkspaceMemberId = (
  principal: Pick<PermissionsPrincipal, 'main'>,
): string | undefined =>
  'workspaceMemberId' in principal.main
    ? principal.main.workspaceMemberId
    : undefined;
