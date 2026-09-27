import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { Module } from '@nestjs/common';
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
  providers: [
    AgentHistoryStorageService,
    AgentHistoryWorkspaceStorageService,
    ...REPOSITORY_PROVIDERS,
  ],
  exports: [
    AgentHistoryStorageService,
    AgentHistoryWorkspaceStorageService,
    ...REPOSITORY_PROVIDERS,
  ],
})
export class AgentHistoryModule {}
