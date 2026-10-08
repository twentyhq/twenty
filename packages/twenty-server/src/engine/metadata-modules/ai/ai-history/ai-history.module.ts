import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { Module } from '@nestjs/common';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { AgentChatFileDownloadService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-file-download.service';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
import { AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

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
  imports: [FileModule, FileUrlModule, WorkspaceCacheModule],
  providers: [
    AgentChatFileDownloadService,
    AgentHistoryWorkspaceStorageService,
    AgentHistoryTransactionService,
    AgentConversationReaderService,
    AgentConversationWriterService,
    AgentTurnRecorderService,
    AgentHistoryUpgradeFenceService,
    ...REPOSITORY_PROVIDERS,
  ],
  exports: [
    AgentChatFileDownloadService,
    AgentHistoryWorkspaceStorageService,
    AgentConversationReaderService,
    AgentConversationWriterService,
    AgentTurnRecorderService,
    AgentHistoryUpgradeFenceService,
    ...REPOSITORY_PROVIDERS,
  ],
})
export class AgentHistoryModule {}
