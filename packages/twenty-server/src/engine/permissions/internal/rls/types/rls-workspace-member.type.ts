/* @license Enterprise */

import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type RlsWorkspaceMember = Pick<WorkspaceMemberWorkspaceEntity, 'id'> &
  Partial<WorkspaceMemberWorkspaceEntity>;
