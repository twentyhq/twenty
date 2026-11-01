/* @license Enterprise */

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

export type PermissionsPrincipal = {
  workspaceId: string;
  intersectionOf: RoleIdsBySource;
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'];
};
