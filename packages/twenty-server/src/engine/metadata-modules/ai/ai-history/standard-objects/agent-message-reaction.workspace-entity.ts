import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AgentMessageReactionWorkspaceEntity extends BaseWorkspaceEntity {
  message: EntityRelation<AgentMessageWorkspaceEntity>;
  messageId: string;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
  agentId: string | null;
  emoji: string;
}
