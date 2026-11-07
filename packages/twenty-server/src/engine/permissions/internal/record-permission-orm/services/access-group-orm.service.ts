/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupDefinition } from 'src/engine/permissions/internal/access-group/types/access-group-definition.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-query.service';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-orm/utils/build-workspace-table-expression.util';

const INSERT_BATCH_SIZE = 500;

const buildAccessGroupTableExpression = (workspaceId: string): string =>
  buildWorkspaceTableExpression({ workspaceId, tableName: 'accessGroup' });

@Injectable()
export class AccessGroupOrmService {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
  ) {}

  async runWithSyncLock({
    workspaceId,
    run,
  }: {
    workspaceId: string;
    run: (transactionScope: RecordPermissionTransactionScope) => Promise<void>;
  }): Promise<void> {
    await this.workspaceQueryExecutorService.runInTransaction(
      async (executor) => {
        const transactionScope: RecordPermissionTransactionScope = {
          workspaceId,
          executeRawQuery: (sql, parameters = []) =>
            executor.execute({ text: sql, values: parameters }),
        };

        await this.recordPermissionQueryService.execute({
          workspaceId,
          transactionScope,
          query: {
            sql: 'SELECT pg_advisory_xact_lock(hashtextextended(:lockKey, 0))',
            parameters: { lockKey: `access-group-sync-${workspaceId}` },
          },
        });

        await run(transactionScope);
      },
    );
  }

  async findGroupHashes({
    workspaceId,
    transactionScope,
  }: {
    workspaceId: string;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<string[]> {
    const rows = await this.recordPermissionQueryService.execute<{
      groupHash: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT "groupHash" FROM ${buildAccessGroupTableExpression(workspaceId)}`,
        parameters: {},
      },
    });

    return rows.map(({ groupHash }) => groupHash);
  }

  async findCompactIdsByGroupHashes({
    workspaceId,
    groupHashes,
  }: {
    workspaceId: string;
    groupHashes: string[];
  }): Promise<number[]> {
    const rows = await this.recordPermissionQueryService.execute<{
      compactId: number;
    }>({
      workspaceId,
      query: {
        sql: `SELECT "compactId" FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "groupHash" = ANY(:groupHashes)`,
        parameters: { groupHashes },
      },
    });

    return rows.map(({ compactId }) => compactId);
  }

  async insertAccessGroups({
    workspaceId,
    definitions,
    transactionScope,
  }: {
    workspaceId: string;
    definitions: AccessGroupDefinition[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    for (
      let start = 0;
      start < definitions.length;
      start += INSERT_BATCH_SIZE
    ) {
      const batch = definitions.slice(start, start + INSERT_BATCH_SIZE);

      await this.recordPermissionQueryService.execute({
        workspaceId,
        transactionScope,
        query: {
          sql: `INSERT INTO ${buildAccessGroupTableExpression(workspaceId)}
            ("roleId", "objectMetadataId", "rowLevelPermissionPredicateGroupId", "memberFieldValues", "groupHash")
            VALUES ${batch
              .map(
                (_, index) =>
                  `(:roleId${index}, :objectMetadataId${index}, :ruleId${index}, CAST(:memberFieldValues${index} AS jsonb), :groupHash${index})`,
              )
              .join(', ')}
            ON CONFLICT DO NOTHING`,
          parameters: Object.fromEntries(
            batch.flatMap((definition, index) => [
              [`roleId${index}`, definition.roleId],
              [`objectMetadataId${index}`, definition.objectMetadataId],
              [`ruleId${index}`, definition.rowLevelPermissionPredicateGroupId],
              [
                `memberFieldValues${index}`,
                isDefined(definition.memberFieldValues)
                  ? JSON.stringify(definition.memberFieldValues)
                  : null,
              ],
              [`groupHash${index}`, definition.groupHash],
            ]),
          ),
        },
      });
    }
  }

  async deleteAccessGroups({
    workspaceId,
    groupHashes,
    transactionScope,
  }: {
    workspaceId: string;
    groupHashes: string[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: {
        sql: `DELETE FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "groupHash" = ANY(:groupHashes)`,
        parameters: { groupHashes },
      },
    });
  }
}
