import { type ActorMetadata } from 'twenty-shared/types';

import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class AgentTurnWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  messages: EntityRelation<AgentMessageWorkspaceEntity[]>;

  threadId: string;
  agentId: string | null;
  status: AgentTurnStatus;
  error: StreamErrorPayload | null;
  startedAt: string | null;
  endedAt: string | null;
  modelId: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: string | null;
  cacheCreationTokens: string | null;
  inputCredits: string | null;
  outputCredits: string | null;
  createdBy: ActorMetadata;
}
