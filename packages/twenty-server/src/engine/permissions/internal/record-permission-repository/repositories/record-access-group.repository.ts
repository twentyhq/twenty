/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { buildOwnAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-own-access-group-ids-expression.util';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { buildRecomputeRecordAccessGroupIdsQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-recompute-record-access-group-ids-query.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RelatedRecordPathFollowingQuery } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-following-query.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
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

  async estimateRecordCountByObjectMetadataId({
    workspaceId,
    flatObjectMetadatas,
  }: {
    workspaceId: string;
    flatObjectMetadatas: FlatObjectMetadata[];
  }): Promise<Map<string, number>> {
    const rows = await this.recordPermissionQueryService.execute<{
      count: string;
    }>({
      workspaceId,
      query: {
        sql: `SELECT GREATEST(COALESCE("reltuples", 0), COALESCE(pg_stat_get_live_tuples(pg_class."oid"), 0), 0)::bigint AS "count"
          FROM unnest(:tableExpressions::text[]) WITH ORDINALITY AS "table"("expression", "position")
          LEFT JOIN pg_class ON pg_class."oid" = to_regclass("table"."expression")
          ORDER BY "table"."position"`,
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

    return new Map(
      flatObjectMetadatas.map(({ id }, index) => [
        id,
        Number(rows[index]?.count ?? 0),
      ]),
    );
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
    accessGroupValueLookupIdsSQLConditions,
    resolvedRelatedRecordPaths,
    accessGroups,
    metadataMaps,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
    accessGroupValueLookupIdsSQLConditions: SQLCondition[];
    resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
    accessGroups: AccessGroup[];
    metadataMaps: Pick<
      RecordAccessGroupComputationMetadataMaps,
      'rolesPermissions' | 'featureFlagsMap'
    >;
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
        accessGroupValueLookupIdsSQLConditions,
        resolvedRelatedRecordPaths,
        accessGroups,
        metadataMaps,
        recordIds,
      }),
    });

    return updatedRows.map(({ id }) => id);
  }

  async addAccessGroupIdsToMatchingRecords({
    workspaceId,
    flatObjectMetadata,
    recordAccessGroupSQLConditions,
    recordIds,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
    recordIds: string[];
  }): Promise<string[]> {
    if (recordAccessGroupSQLConditions.length === 0) {
      return [];
    }

    const alias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);
    const accessGroupIds = `COALESCE(${alias}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)}, CAST('{}' AS integer[]))`;
    const addedAccessGroupIds = buildOwnAccessGroupIdsExpression(
      recordAccessGroupSQLConditions,
    );
    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      query: {
        sql: `UPDATE ${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(flatObjectMetadata),
        })} AS ${alias}
          SET ${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)} = ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(${accessGroupIds} || ${addedAccessGroupIds}) AS "accessGroupId" ORDER BY "accessGroupId")
          WHERE ${alias}."id" = ANY(CAST(:recordIds AS uuid[]))
            AND NOT (${accessGroupIds} @> ${addedAccessGroupIds})
          RETURNING ${alias}."id"`,
        parameters: Object.assign(
          { recordIds },
          ...recordAccessGroupSQLConditions.map(
            ({ sqlCondition }) => sqlCondition?.parameters ?? {},
          ),
        ),
      },
    });

    return rows.map(({ id }) => id);
  }

  async removeAccessGroupIdsFromRecords({
    workspaceId,
    flatObjectMetadata,
    compactIds,
    recordIds,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    compactIds: number[];
    recordIds: string[];
  }): Promise<void> {
    if (compactIds.length === 0) {
      return;
    }

    const accessGroupIdsColumn = escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME);

    await this.recordPermissionQueryService.execute({
      workspaceId,
      query: {
        sql: `UPDATE ${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(flatObjectMetadata),
        })}
          SET ${accessGroupIdsColumn} = ARRAY(SELECT "accessGroupId" FROM unnest(${accessGroupIdsColumn}) AS "accessGroupId" WHERE NOT ("accessGroupId" = ANY(CAST(:removedCompactIds AS integer[]))) ORDER BY "accessGroupId")
          WHERE "id" = ANY(CAST(:recordIds AS uuid[]))
            AND ${accessGroupIdsColumn} && CAST(:removedCompactIds AS integer[])`,
        parameters: { removedCompactIds: compactIds, recordIds },
      },
    });
  }

  async findRecordsFollowingRelatedRecordPaths({
    workspaceId,
    followingQueries,
    transactionScope,
  }: {
    workspaceId: string;
    followingQueries: RelatedRecordPathFollowingQuery[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<{ objectMetadataId: string; id: string }[]> {
    if (followingQueries.length === 0) {
      return [];
    }

    const buildTableExpression = (flatObjectMetadata: FlatObjectMetadata) =>
      buildWorkspaceTableExpression({
        workspaceId,
        tableName: computeObjectTargetTable(flatObjectMetadata),
      });
    const followingQuerySqls = followingQueries.map(
      (
        { targetFlatObjectMetadata, writtenHop, followingHops },
        followingQueryIndex,
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

        return `SELECT ${followingQueryIndex} AS "followingQueryIndex", "target"."id"
          FROM ${[
            ...fromExpressions,
            `${buildTableExpression(targetFlatObjectMetadata)} AS "target"`,
          ].join(', ')}
          WHERE (${writtenJoinColumn} = ANY(:joinValuesBefore_${followingQueryIndex})
            OR ${writtenJoinColumn} IN (
              SELECT "written".${escapeIdentifier(writtenHop.sourceColumnName)}
              FROM ${buildTableExpression(writtenHop.flatObjectMetadata)} AS "written"
              WHERE "written"."id" = ANY(:recordIds_${followingQueryIndex})
            ))
            ${joinConditions.map((joinCondition) => `AND ${joinCondition}`).join(' ')}`;
      },
    );

    const rows = await this.recordPermissionQueryService.execute<{
      followingQueryIndex: number;
      id: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: followingQuerySqls.join(' UNION '),
        parameters: Object.fromEntries(
          followingQueries.flatMap(
            ({ writtenHop, recordIds, recordsBefore }, followingQueryIndex) => [
              [`recordIds_${followingQueryIndex}`, recordIds],
              [
                `joinValuesBefore_${followingQueryIndex}`,
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

    return rows.map(({ followingQueryIndex, id }) => ({
      objectMetadataId:
        followingQueries[Number(followingQueryIndex)].targetFlatObjectMetadata
          .id,
      id,
    }));
  }
}
