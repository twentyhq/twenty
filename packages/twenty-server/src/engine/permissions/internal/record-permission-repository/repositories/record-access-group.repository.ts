/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';
import { type RelatedRecordPathAccessGroupSource } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-access-group-source.type';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { buildRecomputeRecordAccessGroupIdsQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-recompute-record-access-group-ids-query.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RelatedRecordPathFollowingLookup } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-following-lookup.type';
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

  async estimateRecordCount({
    workspaceId,
    flatObjectMetadatas,
  }: {
    workspaceId: string;
    flatObjectMetadatas: FlatObjectMetadata[];
  }): Promise<number> {
    const [row] = await this.recordPermissionQueryService.execute<{
      count: string;
    }>({
      workspaceId,
      query: {
        sql: `SELECT SUM(GREATEST("reltuples", pg_stat_get_live_tuples("oid")))::bigint AS "count"
          FROM unnest(:tableExpressions::text[]) AS "tableExpression"
          JOIN pg_class ON pg_class."oid" = to_regclass("tableExpression")`,
        parameters: {
          tableExpressions: flatObjectMetadatas.map((flatObjectMetadata) =>
            buildWorkspaceTableExpression({
              workspaceId,
              tableName: computeObjectTargetTable(flatObjectMetadata),
            }),
          ),
        },
      },
    });

    return Math.max(0, Number(row?.count ?? 0));
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
    recordAccessGroupSQLConditions,
    relatedRecordPathAccessGroupSources,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
    relatedRecordPathAccessGroupSources: RelatedRecordPathAccessGroupSource[];
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<string[]> {
    const updatedRows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      transactionScope,
      query: buildRecomputeRecordAccessGroupIdsQuery({
        workspaceId,
        flatObjectMetadata,
        recordAccessGroupSQLConditions,
        relatedRecordPathAccessGroupSources,
        recordIds,
      }),
    });

    return updatedRows.map(({ id }) => id);
  }

  async findRecordsFollowingRelatedRecordPaths({
    workspaceId,
    lookups,
    transactionScope,
  }: {
    workspaceId: string;
    lookups: RelatedRecordPathFollowingLookup[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<{ objectMetadataId: string; id: string }[]> {
    if (lookups.length === 0) {
      return [];
    }

    const buildTableExpression = (flatObjectMetadata: FlatObjectMetadata) =>
      buildWorkspaceTableExpression({
        workspaceId,
        tableName: computeObjectTargetTable(flatObjectMetadata),
      });
    const lookupQueries = lookups.map(
      (
        { targetFlatObjectMetadata, writtenHop, followingHops },
        lookupIndex,
      ) => {
        const followingHopAliases = followingHops.map(
          (_, hopIndex) => `following_${hopIndex}`,
        );
        const { fromExpressions, joinConditions } =
          buildRelatedRecordPathHopsJoin({
            workspaceId,
            hops: followingHops,
            hopTableAliases: followingHopAliases,
            targetTableAlias: 'target',
          });
        const writtenJoinColumn = `${escapeIdentifier(followingHopAliases[0] ?? 'target')}.${escapeIdentifier(writtenHop.targetColumnName)}`;

        return `SELECT ${lookupIndex} AS "lookupIndex", "target"."id"
          FROM ${[
            ...fromExpressions,
            `${buildTableExpression(targetFlatObjectMetadata)} AS "target"`,
          ].join(', ')}
          WHERE (${writtenJoinColumn} = ANY(:joinValuesBefore_${lookupIndex})
            OR ${writtenJoinColumn} IN (
              SELECT "written".${escapeIdentifier(writtenHop.sourceColumnName)}
              FROM ${buildTableExpression(writtenHop.flatObjectMetadata)} AS "written"
              WHERE "written"."id" = ANY(:recordIds_${lookupIndex})
            ))
            ${joinConditions.map((joinCondition) => `AND ${joinCondition}`).join(' ')}`;
      },
    );

    const rows = await this.recordPermissionQueryService.execute<{
      lookupIndex: number;
      id: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: lookupQueries.join(' UNION '),
        parameters: Object.fromEntries(
          lookups.flatMap(
            ({ writtenHop, recordIds, recordsBefore }, lookupIndex) => [
              [`recordIds_${lookupIndex}`, recordIds],
              [
                `joinValuesBefore_${lookupIndex}`,
                recordsBefore
                  .map(
                    (recordBefore) => recordBefore[writtenHop.sourceColumnName],
                  )
                  .filter(isDefined),
              ],
            ],
          ),
        ),
      },
    });

    return rows.map(({ lookupIndex, id }) => ({
      objectMetadataId:
        lookups[Number(lookupIndex)].targetFlatObjectMetadata.id,
      id,
    }));
  }
}
