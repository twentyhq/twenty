import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class BlocklistWorkspaceEntity extends BaseWorkspaceEntity {
  handle: string | null;
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;
  workspaceMemberId: string;
}
