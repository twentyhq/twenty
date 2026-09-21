import { type EntityTarget } from 'typeorm';
import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryLifecycleService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-lifecycle.service';
import { Module } from '@nestjs/common';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';

const ENTITY_BY_OBJECT_NAME: Record<
  AgentHistoryObjectName,
  EntityTarget<{ id: string; workspaceId: string }>
> = {
  agentChatThread: AgentChatThreadEntity,
  agentMessage: AgentMessageEntity,
  agentMessagePart: AgentMessagePartEntity,
  agentTurn: AgentTurnEntity,
  agentTurnEvaluation: AgentTurnEvaluationEntity,
};

const REPOSITORY_PROVIDERS = AGENT_HISTORY_OBJECT_NAMES.map((objectName) => ({
  provide: getAgentHistoryRepositoryToken(objectName),
  useFactory: (
    storageService: AgentHistoryStorageService,
    workspaceOrmManager: WorkspaceOrmManager,
  ) =>
    new AgentHistoryRepository(
      objectName,
      ENTITY_BY_OBJECT_NAME[objectName],
      storageService,
      workspaceOrmManager,
    ),
  inject: [AgentHistoryStorageService, WorkspaceOrmManager],
}));

@Module({
  providers: [
    AgentHistoryStorageService,
    AgentHistoryLifecycleService,
    ...REPOSITORY_PROVIDERS,
  ],
  exports: [
    AgentHistoryStorageService,
    AgentHistoryLifecycleService,
    ...REPOSITORY_PROVIDERS,
  ],
})
export class AgentHistoryModule {}
