import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import {
  type AgentMessageRole,
  type AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

export class AgentMessageWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  turn: EntityRelation<AgentTurnWorkspaceEntity> | null;
  parts: EntityRelation<AgentMessagePartWorkspaceEntity[]>;

  threadId: string;
  turnId: string | null;
  agentId: string | null;
  role: AgentMessageRole;
  status: AgentMessageStatus;
  isHidden: boolean;
  processedAt: string | null;
}
