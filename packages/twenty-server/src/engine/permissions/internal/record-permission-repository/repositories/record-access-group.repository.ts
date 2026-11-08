/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';
import { buildRecomputeRecordAccessGroupIdsQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-recompute-record-access-group-ids-query.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class RecordAccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findRecordIds({
    workspaceId,
    flatObjectMetadata,
    afterRecordId,
    limit,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    afterRecordId: string | null;
    limit: number;
  }): Promise<string[]> {
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      query: {
        sql: `SELECT "id" FROM ${tableExpression}
          ${isDefined(afterRecordId) ? 'WHERE "id" > :afterRecordId' : ''}
          ORDER BY "id"
          LIMIT :limit`,
        parameters: { afterRecordId, limit },
      },
    });

    return rows.map(({ id }) => id);
  }

  async findRelatedRecordIds({
    workspaceId,
    sourceFlatObjectMetadata,
    targetFlatObjectMetadata,
    sourceColumnName,
    targetColumnName,
    recordIds,
    recordsBefore,
    transactionScope,
  }: {
    workspaceId: string;
    sourceFlatObjectMetadata: FlatObjectMetadata;
    targetFlatObjectMetadata: FlatObjectMetadata;
    sourceColumnName: string;
    targetColumnName: string;
    recordIds: string[];
    recordsBefore: Record<string, unknown>[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<string[]> {
    const sourceTable = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(sourceFlatObjectMetadata),
    });
    const targetTable = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(targetFlatObjectMetadata),
    });
    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT "source"."id" FROM ${sourceTable} AS "source"
          WHERE "source".${escapeIdentifier(sourceColumnName)} = ANY(:joinValuesBefore)
            OR "source".${escapeIdentifier(sourceColumnName)} IN (
              SELECT "target".${escapeIdentifier(targetColumnName)}
              FROM ${targetTable} AS "target"
              WHERE "target"."id" = ANY(:recordIds)
            )`,
        parameters: {
          recordIds,
          joinValuesBefore: recordsBefore
            .map((recordBefore) => recordBefore[targetColumnName])
            .filter(isDefined),
        },
      },
    });

    return rows.map(({ id }) => id);
  }

  async updateRecordAccessGroupIds({
    workspaceId,
    flatObjectMetadata,
    recordAccessGroupConditions,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordAccessGroupConditions: RecordAccessGroupCondition[];
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: buildRecomputeRecordAccessGroupIdsQuery({
        workspaceId,
        flatObjectMetadata,
        recordAccessGroupConditions,
        recordIds,
      }),
    });
  }
}
