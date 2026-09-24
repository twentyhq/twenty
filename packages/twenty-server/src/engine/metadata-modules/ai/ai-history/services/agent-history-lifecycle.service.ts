import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';

export const AGENT_HISTORY_DEFAULT_STORAGE_KEY =
  'agent-history-new-workspace-storage-v1';

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
      const defaults: { value: { storage: string } }[] = await runner.query(
        `SELECT value FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" IS NULL AND "userId" IS NULL AND "applicationId" IS NULL AND type = 'CONFIG_VARIABLE'`,
        [AGENT_HISTORY_DEFAULT_STORAGE_KEY],
      );
      const selected = defaults[0]?.value?.storage ?? 'workspace';
      if (selected !== 'core' && selected !== 'workspace') {
        throw new Error('Invalid default agent history storage');
      }
      // Initialization can be retried. Existing data must use verified migration.
      const legacy = await runner.query(
        'SELECT 1 FROM core."agentChatThread" WHERE "workspaceId" = $1 LIMIT 1',
        [workspaceId],
      );
      await this.storage.writeState(runner, workspaceId, {
        storage: isNonEmptyArray(legacy) ? 'core' : selected,
        ...(!isNonEmptyArray(legacy) && selected === 'workspace'
          ? { verifiedAt: new Date().toISOString() }
          : {}),
      });
    });
  }

  async setNewWorkspaceDefault(storage: 'core' | 'workspace'): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO core."keyValuePair" ("key", "type", "value") VALUES ($1, 'CONFIG_VARIABLE', $2::jsonb)
      ON CONFLICT ("key") WHERE "userId" IS NULL AND "workspaceId" IS NULL AND "applicationId" IS NULL
      DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()`,
      [AGENT_HISTORY_DEFAULT_STORAGE_KEY, JSON.stringify({ storage })],
    );
  }
}
