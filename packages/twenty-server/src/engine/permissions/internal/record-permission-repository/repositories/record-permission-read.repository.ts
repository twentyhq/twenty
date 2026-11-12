/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildFindRecordSharesQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-find-record-shares-query.util';
import {
  buildFindRuleRecordSharesQuery,
  type RuleRecordSharesScope,
} from 'src/engine/permissions/internal/record-permission-repository/utils/build-find-rule-record-shares-query.util';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-share-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordPermissionReadRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findRecordShares({
    workspaceId,
    objectMetadataId,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<RecordShare[]> {
    if (recordIds.length === 0) {
      return [];
    }

    return this.recordPermissionQueryService.execute<RecordShare>({
      workspaceId,
      transactionScope,
      query: buildFindRecordSharesQuery({
        recordShareTableExpression: buildRecordShareTableExpression({
          workspaceId,
        }),
        objectMetadataId,
        recordIds,
      }),
    });
  }

  findRuleRecordShares({
    workspaceId,
    objectMetadataId,
    scope,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    scope: RuleRecordSharesScope;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<RecordShare[]> {
    return this.recordPermissionQueryService.execute<RecordShare>({
      workspaceId,
      transactionScope,
      query: buildFindRuleRecordSharesQuery({
        recordShareTableExpression: buildRecordShareTableExpression({
          workspaceId,
        }),
        objectMetadataId,
        scope,
      }),
    });
  }

  async findRecordShareAccessLevelsByObjectMetadataId({
    workspaceId,
    principalIds,
  }: {
    workspaceId: string;
    principalIds: string[];
  }): Promise<Map<string, RecordShareAccessLevel[]>> {
    if (principalIds.length === 0) {
      return new Map();
    }

    const rows = await this.recordPermissionQueryService.execute<{
      objectMetadataId: string;
      accessLevel: RecordShareAccessLevel;
    }>({
      workspaceId,
      query: {
        sql: `SELECT DISTINCT "objectMetadataId", "accessLevel" FROM ${buildRecordShareTableExpression({ workspaceId })} WHERE "principalId" = ANY(:principalIds) AND "deletedAt" IS NULL`,
        parameters: { principalIds },
      },
    });

    return rows.reduce((accessLevelsByObjectMetadataId, row) => {
      accessLevelsByObjectMetadataId.set(row.objectMetadataId, [
        ...(accessLevelsByObjectMetadataId.get(row.objectMetadataId) ?? []),
        row.accessLevel,
      ]);

      return accessLevelsByObjectMetadataId;
    }, new Map<string, RecordShareAccessLevel[]>());
  }

  async findRecordIdsMatchingSQLConditions({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    sqlConditions,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    sqlConditions: (SQLCondition | boolean)[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Set<string>[]> {
    if (sqlConditions.every((sqlCondition) => sqlCondition === false)) {
      return sqlConditions.map(() => new Set());
    }

    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const tableAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
    const sqlConditionColumns = sqlConditions.flatMap((sqlCondition, index) =>
      isObject(sqlCondition)
        ? [
            `CASE WHEN ${sqlCondition.sql} THEN TRUE ELSE FALSE END AS "matches_${index}"`,
          ]
        : [],
    );

    const rows = await this.recordPermissionQueryService.execute<
      { id: string } & Record<string, unknown>
    >({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT ${[`${tableAlias}."id" AS "id"`, ...sqlConditionColumns].join(', ')} FROM ${tableExpression} AS ${tableAlias} WHERE ${tableAlias}."id" = ANY(:candidateRecordIds)`,
        parameters: {
          ...Object.assign(
            {},
            ...sqlConditions.map((sqlCondition) =>
              isObject(sqlCondition) ? sqlCondition.parameters : {},
            ),
          ),
          candidateRecordIds: recordIds,
        },
      },
    });

    return sqlConditions.map(
      (sqlCondition, index) =>
        new Set(
          rows
            .filter(
              (row) =>
                sqlCondition === true || row[`matches_${index}`] === true,
            )
            .map(({ id }) => id),
        ),
    );
  }

  async findRelationJoinValues({
    workspaceId,
    targetFlatObjectMetadata,
    targetColumnName,
    tableAlias,
    sqlCondition,
    joinValues,
    transactionScope,
  }: {
    workspaceId: string;
    targetFlatObjectMetadata: FlatObjectMetadata;
    targetColumnName: string;
    tableAlias: string;
    sqlCondition: SQLCondition | null;
    joinValues: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<string[]> {
    if (joinValues.length === 0) {
      return [];
    }

    const quotedTableAlias = escapeIdentifier(tableAlias);
    const quotedColumn = `${quotedTableAlias}.${escapeIdentifier(targetColumnName)}`;
    const rows = await this.recordPermissionQueryService.execute<{
      joinValue: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT DISTINCT ${quotedColumn} AS "joinValue"
          FROM ${buildWorkspaceTableExpression({
            workspaceId,
            tableName: computeObjectTargetTable(targetFlatObjectMetadata),
          })} AS ${quotedTableAlias}
          WHERE ${quotedColumn} = ANY(:joinValues)
            AND ${quotedTableAlias}."deletedAt" IS NULL
            ${isDefined(sqlCondition) ? `AND (${sqlCondition.sql})` : ''}`,
        parameters: { ...(sqlCondition?.parameters ?? {}), joinValues },
      },
    });

    return rows.map(({ joinValue }) => joinValue);
  }

  async findRecordIdsMatchingSQLCondition({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    sqlCondition,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    sqlCondition: SQLCondition | true;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Set<string>> {
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const tableAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
    const sqlConditionClause = isObject(sqlCondition)
      ? ` AND (${sqlCondition.sql})`
      : '';

    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT ${tableAlias}."id" FROM ${tableExpression} AS ${tableAlias} WHERE ${tableAlias}."id" = ANY(:candidateRecordIds)${sqlConditionClause}`,
        parameters: {
          ...(isObject(sqlCondition) ? sqlCondition.parameters : {}),
          candidateRecordIds: recordIds,
        },
      },
    });

    return new Set(rows.map(({ id }) => id));
  }
}
