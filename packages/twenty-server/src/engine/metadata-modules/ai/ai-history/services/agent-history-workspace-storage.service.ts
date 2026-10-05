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

  getContext(workspaceId: string): AgentHistoryStorageContext {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryStorageException(
        'INVALID_WORKSPACE',
        'Agent history requires a workspace ID',
      );
    }

    return {
      manager: this.dataSource.manager,
      table: getWorkspaceAgentHistoryTable(workspaceId),
    };
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    const { table } = this.getContext(workspaceId);

    return this.dataSource.transaction((manager) => work({ manager, table }));
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
    // One snapshot keeps a paginated report's rows and counts consistent
    return this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');

      // Older installations can keep workspace records without a schema
      const provisioned: { workspaceId: string }[] = await manager.query(
        `SELECT id AS "workspaceId" FROM unnest($1::uuid[], $2::text[]) AS candidate(id, table_name)
         WHERE to_regclass(table_name) IS NOT NULL`,
        [
          workspaceIds,
          workspaceIds.map((workspaceId) =>
            getWorkspaceAgentHistoryTable(workspaceId)('agentChatThread'),
          ),
        ],
      );

      return work({
        manager,
        partitions: provisioned.map(({ workspaceId }) => ({
          workspaceIds: [workspaceId],
          table: getWorkspaceAgentHistoryTable(workspaceId),
        })),
      });
    });
  }
}
