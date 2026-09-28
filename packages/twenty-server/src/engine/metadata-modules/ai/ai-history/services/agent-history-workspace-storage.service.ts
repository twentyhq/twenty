import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  table: (name: AgentHistoryObjectName) => string;
};

// Deployed upgrade commands use this key for their exclusive copy lock.
const HISTORY_READINESS_KEY = 'agent-history-storage-v1';

const getWorkspaceAgentHistoryTable =
  (workspaceId: string) => (name: AgentHistoryObjectName) =>
    `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`;

@Injectable()
export class AgentHistoryWorkspaceStorageService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async initializeWorkspace(workspaceId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${HISTORY_READINESS_KEY}:runner:${workspaceId}`],
      );
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${HISTORY_READINESS_KEY}:${workspaceId}`],
      );
      // Never mark a lost route or a workspace with legacy history as migrated.
      await manager.query(
        `INSERT INTO core."keyValuePair" ("key", "workspaceId", type, value)
         SELECT $1, $2, 'CONFIG_VARIABLE', $3::jsonb
         WHERE NOT EXISTS (SELECT 1 FROM core."agentChatThread" WHERE "workspaceId" = $2)
           AND NOT EXISTS (SELECT 1 FROM ${getWorkspaceAgentHistoryTable(workspaceId)('agentChatThread')})
         ON CONFLICT ("key", "workspaceId") WHERE "userId" IS NULL AND "applicationId" IS NULL DO NOTHING`,
        [
          HISTORY_READINESS_KEY,
          workspaceId,
          JSON.stringify({
            storage: 'workspace',
            verifiedAt: new Date().toISOString(),
          }),
        ],
      );
    });
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryStorageException(
        'INVALID_WORKSPACE',
        'Agent history requires a workspace ID',
      );
    }

    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      await runner.startTransaction();
      // A retried upgrade clears its destination; no live write may race that copy.
      await runner.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [`${HISTORY_READINESS_KEY}:${workspaceId}`],
      );
      const ready = await runner.query(
        `SELECT 1 FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = $2
         AND "userId" IS NULL AND "applicationId" IS NULL AND type = 'CONFIG_VARIABLE'
         AND value->>'storage' = 'workspace' AND NOT (value ? 'migration')`,
        [HISTORY_READINESS_KEY, workspaceId],
      );
      if (ready.length === 0) {
        throw new ServiceUnavailableException(
          'AI history is unavailable until this workspace finishes upgrading.',
        );
      }
      const result = await work({
        manager: runner.manager,
        table: getWorkspaceAgentHistoryTable(workspaceId),
      });
      await runner.commitTransaction();
      return result;
    } catch (error) {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      throw error;
    } finally {
      await runner.release();
    }
  }

  async runReadOnlyReport<TResult>(
    workspaceIds: string[],
    work: (context: {
      manager: EntityManager;
      partitions: {
        workspaceIds: string[];
        table: AgentHistoryStorageContext['table'];
      }[];
    }) => Promise<TResult>,
  ): Promise<TResult> {
    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      await runner.startTransaction('REPEATABLE READ');
      await runner.query('SET TRANSACTION READ ONLY');
      // Unprovisioned workspaces have no history tables to include in reports.
      const provisioned: { workspaceId: string }[] = await runner.query(
        `SELECT id AS "workspaceId" FROM unnest($1::uuid[], $2::text[]) AS candidate(id, table_name) WHERE to_regclass(table_name) IS NOT NULL
         AND EXISTS (SELECT 1 FROM core."keyValuePair" state WHERE state."workspaceId" = candidate.id
           AND state."key" = $3 AND state."userId" IS NULL AND state."applicationId" IS NULL
           AND state.type = 'CONFIG_VARIABLE' AND state.value->>'storage' = 'workspace'
           AND NOT (state.value ? 'migration'))`,
        [
          workspaceIds,
          workspaceIds.map((workspaceId) =>
            getWorkspaceAgentHistoryTable(workspaceId)('agentChatThread'),
          ),
          HISTORY_READINESS_KEY,
        ],
      );
      const partitions = provisioned.map(({ workspaceId }) => ({
        workspaceIds: [workspaceId],
        table: getWorkspaceAgentHistoryTable(workspaceId),
      }));
      const result = await work({ manager: runner.manager, partitions });
      await runner.commitTransaction();
      return result;
    } catch (error) {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }
}
