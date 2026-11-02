/* @license Enterprise */

import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type PermissionsPrincipalWorkspaceMember = Pick<
  WorkspaceMemberWorkspaceEntity,
  'id'
> &
  Partial<WorkspaceMemberWorkspaceEntity>;

export type PermissionsPrincipal = {
  workspaceId: string;
  intersectionOf: RoleIdsBySource;
  workspaceMember?: PermissionsPrincipalWorkspaceMember;
};
