import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';

export class AgentChatThreadWorkspaceEntity extends BaseWorkspaceEntity {
  messages: EntityRelation<AgentMessageWorkspaceEntity[]>;
  turns: EntityRelation<AgentTurnWorkspaceEntity[]>;

  archivedAt: string | null;
  userWorkspaceId: string;
  title: string | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  contextWindowTokens: number | null;
  conversationSize: number;
  totalInputCredits: string;
  totalOutputCredits: string;
  totalCacheReadTokens: string;
  totalCacheCreationTokens: string;
  activeStreamId: string | null;
  pendingQuestionMessageId: string | null;
  lastStreamError: AgentChatThreadLastStreamError | null;
}
