import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type QueryRunner } from 'typeorm';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const AGENT_HISTORY_DEFAULT_STORAGE_KEY =
  'agent-history-new-workspace-storage-v1';

@Injectable()
export class AgentHistoryLifecycleService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly storage: AgentHistoryStorageService,
  ) {}

  async prepareCoreReferences(workspaceId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const runner = manager.queryRunner!;
      await runner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:schema:${workspaceId}`],
      );
      await this.addCoreReferences(runner, workspaceId);
    });
  }

  private async addCoreReferences(
    runner: QueryRunner,
    workspaceId: string,
  ): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);
    // Core identities are not workspace objects. Keep their database lifecycle
    // constraints here while the five history objects use metadata relations.
    for (const reference of [
      {
        table: 'agentChatThread',
        column: 'userWorkspaceId',
        parent: 'userWorkspace',
        onDelete: 'CASCADE',
      },
      {
        table: 'agentMessagePart',
        column: 'fileId',
        parent: 'file',
        onDelete: 'RESTRICT',
      },
    ]) {
      const name = `FK_agent_history_${reference.column}`;
      const existing: { valid: boolean }[] = await runner.query(
        `SELECT c.contype = 'f' AND c.convalidated AND c.confrelid = to_regclass($4)
          AND c.confdeltype = $5 AND c.conkey = ARRAY[child.attnum] AND c.confkey = ARRAY[parent.attnum] AS valid
         FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace
         LEFT JOIN pg_attribute child ON child.attrelid = t.oid AND child.attname = $6
         LEFT JOIN pg_attribute parent ON parent.attrelid = c.confrelid AND parent.attname = 'id'
         WHERE n.nspname = $1 AND t.relname = $2 AND c.conname = $3`,
        [
          schema,
          reference.table,
          name,
          `core.${escapeIdentifier(reference.parent)}`,
          reference.onDelete === 'CASCADE' ? 'c' : 'r',
          reference.column,
        ],
      );
      if (isNonEmptyArray(existing) && !existing[0].valid) {
        throw new Error(
          `Agent history constraint ${reference.table}.${name} has drifted`,
        );
      }
      if (!isNonEmptyArray(existing)) {
        await runner.query(
          `ALTER TABLE ${escapeIdentifier(schema)}.${escapeIdentifier(reference.table)} ADD CONSTRAINT ${escapeIdentifier(name)} FOREIGN KEY (${escapeIdentifier(reference.column)}) REFERENCES core.${escapeIdentifier(reference.parent)} (id) ON DELETE ${reference.onDelete}`,
        );
      }
    }
  }

  async initializeWorkspace(workspaceId: string): Promise<void> {
    await this.prepareCoreReferences(workspaceId);
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
