import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { AgentHistoryLifecycleService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-lifecycle.service';
import { Module } from '@nestjs/common';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const REPOSITORY_PROVIDERS = AGENT_HISTORY_OBJECT_NAMES.map((objectName) => ({
  provide: getAgentHistoryRepositoryToken(objectName),
  useFactory: (
    storageService: AgentHistoryStorageService,
    workspaceOrmManager: WorkspaceOrmManager,
  ) =>
    new AgentHistoryRepository(objectName, storageService, workspaceOrmManager),
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
