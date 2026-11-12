/* @license Enterprise */

import { type PermissionsMainPrincipal } from 'src/engine/permissions/internal/principal/types/permissions-principal.type';

export const isPermissionMainPrincipalWorkspaceMember = <
  TMainPrincipal extends PermissionsMainPrincipal,
>(
  mainPrincipal: TMainPrincipal,
): mainPrincipal is Extract<TMainPrincipal, { type: 'workspaceMember' }> =>
  mainPrincipal.type === 'workspaceMember';
