import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { Module } from '@nestjs/common';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const REPOSITORY_PROVIDERS = AGENT_HISTORY_OBJECT_NAMES.map((objectName) => ({
  provide: getAgentHistoryRepositoryToken(objectName),
  useFactory: (
    storageService: AgentHistoryWorkspaceStorageService,
    workspaceOrmManager: WorkspaceOrmManager,
  ) =>
    new AgentHistoryRepository(objectName, storageService, workspaceOrmManager),
  inject: [AgentHistoryWorkspaceStorageService, WorkspaceOrmManager],
}));

@Module({
  imports: [FileUrlModule],
  providers: [
    AgentHistoryWorkspaceStorageService,
    AgentHistoryTransactionService,
    AgentConversationReaderService,
    AgentConversationWriterService,
    AgentTurnRecorderService,
    ...REPOSITORY_PROVIDERS,
  ],
  exports: [
    AgentHistoryWorkspaceStorageService,
    AgentConversationReaderService,
    AgentConversationWriterService,
    AgentTurnRecorderService,
    ...REPOSITORY_PROVIDERS,
  ],
})
export class AgentHistoryModule {}
