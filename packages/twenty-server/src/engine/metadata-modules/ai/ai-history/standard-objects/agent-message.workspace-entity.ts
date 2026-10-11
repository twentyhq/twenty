import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';

export class AgentMessageWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  turn: EntityRelation<AgentTurnWorkspaceEntity> | null;
  parts: EntityRelation<AgentMessagePartWorkspaceEntity[]>;

  threadId: string;
  turnId: string | null;
  agentId: string | null;
  senderWorkspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  senderWorkspaceMemberId: string | null;
  senderUserWorkspaceId: string | null;
  senderApplicationId: string | null;
  role: AgentMessageRole;
  status: AgentMessageStatus;
  // No longer read since 2.46 turned hidden messages into system messages; the 2.42 history move still copies it
  isHidden: boolean;
  processedAt: string | null;
}
