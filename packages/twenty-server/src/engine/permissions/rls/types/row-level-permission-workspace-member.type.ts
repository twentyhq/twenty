/* @license Enterprise */

import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type RowLevelPermissionWorkspaceMember = Pick<
  WorkspaceMemberWorkspaceEntity,
  'id'
> &
  Partial<WorkspaceMemberWorkspaceEntity>;
