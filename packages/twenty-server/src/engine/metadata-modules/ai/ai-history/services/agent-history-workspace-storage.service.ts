import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  table: (name: AgentHistoryObjectName) => string;
};

const getWorkspaceAgentHistoryTable =
  (workspaceId: string) => (name: AgentHistoryObjectName) =>
    `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`;

@Injectable()
export class AgentHistoryWorkspaceStorageService {
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
        `SELECT id AS "workspaceId" FROM unnest($1::uuid[], $2::text[]) AS candidate(id, table_name) WHERE to_regclass(table_name) IS NOT NULL`,
        [
          workspaceIds,
          workspaceIds.map((workspaceId) =>
            getWorkspaceAgentHistoryTable(workspaceId)('agentChatThread'),
          ),
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
