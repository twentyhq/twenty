import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnEvaluationWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn-evaluation.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class AgentTurnWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  messages: EntityRelation<AgentMessageWorkspaceEntity[]>;
  evaluations: EntityRelation<AgentTurnEvaluationWorkspaceEntity[]>;

  threadId: string;
  agentId: string | null;
}
