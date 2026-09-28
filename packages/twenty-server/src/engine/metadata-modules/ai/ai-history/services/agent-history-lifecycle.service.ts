import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';

@Injectable()
export class AgentHistoryLifecycleService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly storage: AgentHistoryStorageService,
  ) {}

  async initializeWorkspace(workspaceId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const runner = manager.queryRunner!;
      // Initialization must not select a route between a runner's initial read
      // and its first fenced transition.
      await runner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:runner:${workspaceId}`],
      );
      await runner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:${workspaceId}`],
      );
      const existing = await runner.query(
        'SELECT 1 FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = $2 AND "userId" IS NULL AND "applicationId" IS NULL',
        [AGENT_HISTORY_STORAGE_KEY, workspaceId],
      );
      if (isNonEmptyArray(existing)) {
        await this.storage.readState(runner, workspaceId);
        return;
      }
      // Detect lost routes with workspace data before an initialization retry.
      await this.storage.readState(runner, workspaceId);
      // Initialization can be retried. Existing data must use verified migration.
      const legacy = await runner.query(
        'SELECT 1 FROM core."agentChatThread" WHERE "workspaceId" = $1 LIMIT 1',
        [workspaceId],
      );
      await this.storage.writeState(
        runner,
        workspaceId,
        isNonEmptyArray(legacy)
          ? { storage: 'core' }
          : { storage: 'workspace', verifiedAt: new Date().toISOString() },
      );
    });
  }
}
