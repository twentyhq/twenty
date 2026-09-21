import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager, type QueryRunner } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import {
  agentHistoryStorageStateSchema,
  type AgentHistoryStorageState,
} from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  storage: 'core' | 'workspace';
  table: (name: AgentHistoryObjectName) => string;
};

@Injectable()
export class AgentHistoryStorageService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
      // The route cannot change between this primary read and the operation.
      await runner.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:${workspaceId}`],
      );
      const state = await this.readState(runner, workspaceId);
      if (state.migration) {
        throw new ServiceUnavailableException(
          'AI history is being migrated. Please retry shortly.',
        );
      }
      const schema =
        state.storage === 'core' ? 'core' : getWorkspaceSchemaName(workspaceId);
      const result = await work({
        manager: runner.manager,
        storage: state.storage,
        table: (name) =>
          `${escapeIdentifier(schema)}.${escapeIdentifier(name)}`,
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

  async readState(
    runner: QueryRunner,
    workspaceId: string,
  ): Promise<AgentHistoryStorageState> {
    return (await this.readStates(runner, [workspaceId])).get(workspaceId)!;
  }

  private async readStates(
    runner: QueryRunner,
    workspaceIds: string[],
  ): Promise<Map<string, AgentHistoryStorageState>> {
    const rows: { workspaceId: string; type: string; value: unknown }[] =
      await runner.query(
        `SELECT "workspaceId", type, value FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = ANY($2::uuid[]) AND "userId" IS NULL AND "applicationId" IS NULL`,
        [AGENT_HISTORY_STORAGE_KEY, workspaceIds],
      );
    const states = new Map<string, AgentHistoryStorageState>();
    for (const row of rows) {
      const parsed = agentHistoryStorageStateSchema.safeParse(row.value);
      if (row.type !== 'CONFIG_VARIABLE' || !parsed.success) {
        throw new AgentHistoryStorageException(
          'INVALID_STATE',
          `Invalid agent history storage state for ${row.workspaceId}`,
        );
      }
      states.set(row.workspaceId, parsed.data);
    }
    const missing = workspaceIds.filter((id) => !states.has(id));
    if (missing.length) {
      const prepared: { workspaceId: string; tableName: string }[] =
        await runner.query(
          `SELECT id AS "workspaceId", table_name AS "tableName" FROM unnest($1::uuid[], $2::text[]) AS candidate(id, table_name) WHERE to_regclass(table_name) IS NOT NULL`,
          [
            missing,
            missing.map(
              (id) =>
                `${escapeIdentifier(getWorkspaceSchemaName(id))}."agentChatThread"`,
            ),
          ],
        );
      // A lost route must never silently expose an empty legacy snapshot after cleanup.
      // Empty, never-routed stores remain indistinguishable during the expand release.
      for (let offset = 0; offset < prepared.length; offset += 50) {
        const batch = prepared.slice(offset, offset + 50);
        const populated: { workspaceId: string }[] = await runner.query(
          batch
            .map(
              ({ tableName }, index) =>
                `SELECT $${index + 1}::uuid AS "workspaceId" WHERE EXISTS (SELECT 1 FROM ${tableName})`,
            )
            .join(' UNION ALL '),
          batch.map(({ workspaceId }) => workspaceId),
        );
        if (populated.length) {
          throw new AgentHistoryStorageException(
            'MISSING_STATE',
            `Agent history route is missing for ${populated[0].workspaceId}; restore its durable state before serving traffic`,
          );
        }
      }
      for (const workspaceId of missing)
        states.set(workspaceId, { storage: 'core' });
    }
    return states;
  }

  async runReadOnlyReport<TResult>(
    workspaceIds: string[],
    work: (context: {
      manager: EntityManager;
      partitions: {
        workspaceIds: string[];
        storage: 'core' | 'workspace';
        table: AgentHistoryStorageContext['table'];
      }[];
    }) => Promise<TResult>,
  ): Promise<TResult> {
    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      // One MVCC snapshot sees both the route and its data before or after a
      // cutover/cleanup. Reports need no per-workspace locks or second pool.
      await runner.startTransaction('REPEATABLE READ');
      await runner.query('SET TRANSACTION READ ONLY');
      const states = await this.readStates(runner, workspaceIds);
      const coreIds: string[] = [];
      const partitions: {
        workspaceIds: string[];
        storage: 'core' | 'workspace';
        table: AgentHistoryStorageContext['table'];
      }[] = [];
      for (const [workspaceId, state] of states) {
        if (state.migration) {
          continue;
        }
        if (state.storage === 'core') {
          coreIds.push(workspaceId);
        } else {
          partitions.push({
            workspaceIds: [workspaceId],
            storage: 'workspace',
            table: (name) =>
              `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`,
          });
        }
      }
      if (coreIds.length) {
        partitions.unshift({
          workspaceIds: coreIds,
          storage: 'core',
          table: (name) => `core.${escapeIdentifier(name)}`,
        });
      }
      const result = await work({ manager: runner.manager, partitions });
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

  async writeState(
    runner: QueryRunner,
    workspaceId: string,
    state: AgentHistoryStorageState,
  ): Promise<void> {
    const rows = await runner.query(
      `INSERT INTO core."keyValuePair" ("key", "workspaceId", "type", "value") VALUES ($1, $2, 'CONFIG_VARIABLE', $3::jsonb)
       ON CONFLICT ("key", "workspaceId") WHERE "userId" IS NULL AND "applicationId" IS NULL
       DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now() WHERE "keyValuePair".type = 'CONFIG_VARIABLE' RETURNING "key"`,
      [AGENT_HISTORY_STORAGE_KEY, workspaceId, JSON.stringify(state)],
    );
    if (!rows.length) {
      throw new AgentHistoryStorageException(
        'INVALID_STATE',
        'Agent history route conflicts with a non-configuration key',
      );
    }
  }
}
