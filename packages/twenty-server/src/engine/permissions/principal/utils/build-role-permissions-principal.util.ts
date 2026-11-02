/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

export const buildRolePermissionsPrincipal = ({
  workspaceId,
  roleId,
  applicationId,
}: {
  workspaceId: string;
  roleId: string;
  applicationId?: string;
}): PermissionsPrincipal => ({
  workspaceId,
  roleIds: [roleId],
  applicationId,
});
