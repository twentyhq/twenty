/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { type PrivateRecordStateRow } from 'src/engine/permissions/record-permission-orm/types/private-record-state-row.type';
import { type RecordPermissionQuery } from 'src/engine/permissions/record-permission-orm/types/record-permission-query.type';
import { type RecordShareCriteria } from 'src/engine/permissions/record-permission-orm/types/record-share-criteria.type';
import { buildDeleteRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-delete-record-shares-query.util';
import { buildInsertRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-insert-record-shares-query.util';
import { buildFindPrivateRecordStatesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-find-private-record-states-query.util';
import { buildFindRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-find-record-shares-query.util';
import { buildRecordShareTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-record-share-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-workspace-table-expression.util';
import { indexPrivateRecordStatesByRecordId } from 'src/engine/permissions/record-permission-orm/utils/index-private-record-states-by-record-id.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import {
  compileNamedParameters,
  type NamedParameters,
} from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordPermissionOrmService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<RecordShare[]> {
    if (recordIds.length === 0) {
      return [];
    }

    return this.executeQuery<RecordShare>({
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

    const rows = await this.executeQuery<{
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

  async findPrivateRecordStates({
    workspaceId,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<Map<string, PrivateRecordState>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const rows = await this.executeQuery<PrivateRecordStateRow>({
      workspaceId,
      transactionScope,
      query: buildFindPrivateRecordStatesQuery({
        tableExpression: buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(flatObjectMetadata),
        }),
        flatObjectMetadata,
        flatFieldMetadataMaps,
        recordIds,
      }),
    });

    return indexPrivateRecordStatesByRecordId(rows);
  }

  async findRecordIdsMatchingCondition({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    condition,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    condition: SqlCondition | true;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<Set<string>> {
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const tableAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
    const conditionClause = isObject(condition)
      ? ` AND (${condition.sql})`
      : '';

    const rows = await this.executeQuery<{ id: string }>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT ${tableAlias}."id" FROM ${tableExpression} AS ${tableAlias} WHERE ${tableAlias}."id" = ANY(:candidateRecordIds)${conditionClause}`,
        parameters: {
          ...(isObject(condition) ? condition.parameters : {}),
          candidateRecordIds: recordIds,
        },
      },
    });

    return new Set(rows.map(({ id }) => id));
  }

  async insertRecordShares({
    workspaceId,
    recordShares,
    shouldIgnoreConflicts,
    transactionScope,
  }: {
    workspaceId: string;
    recordShares: RecordShareInput[];
    shouldIgnoreConflicts: boolean;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordShares.length === 0) {
      return;
    }

    await this.executeQuery({
      workspaceId,
      transactionScope,
      query: buildInsertRecordSharesQuery({
        recordShareTableExpression: buildRecordShareTableExpression({
          workspaceId,
        }),
        recordShares,
        shouldIgnoreConflicts,
      }),
    });
  }

  async deleteRecordShares({
    workspaceId,
    criteria,
    transactionScope,
  }: {
    workspaceId: string;
    criteria: RecordShareCriteria;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    await this.executeQuery({
      workspaceId,
      transactionScope,
      query: buildDeleteRecordSharesQuery({
        recordShareTableExpression: buildRecordShareTableExpression({
          workspaceId,
        }),
        criteria,
      }),
    });
  }

  async insertOwnerRecordSharesFromSelect({
    workspaceId,
    recordSelect,
    parameters,
    granteeWorkspaceMemberId,
  }: {
    workspaceId: string;
    recordSelect: string;
    parameters: NamedParameters;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    await this.executeQuery({
      workspaceId,
      query: {
        sql: `INSERT INTO ${buildRecordShareTableExpression({ workspaceId })}
           ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
         SELECT granted_record."objectMetadataId", granted_record."recordId", :granteeWorkspaceMemberId, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', granted_record."recordId"
         FROM (${recordSelect}) AS granted_record
         ON CONFLICT DO NOTHING`,
        parameters: { ...parameters, granteeWorkspaceMemberId },
      },
    });
  }

  // Without a custodian the departing member's grants are only dropped
  async transferMemberRecordShares({
    workspaceId,
    objectMetadataIds,
    fromWorkspaceMemberId,
    toWorkspaceMemberId,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
    fromWorkspaceMemberId: string;
    toWorkspaceMemberId: string | undefined;
  }): Promise<void> {
    const recordShareTable = buildRecordShareTableExpression({ workspaceId });
    const parameters = {
      objectMetadataIds,
      fromWorkspaceMemberId,
      toWorkspaceMemberId,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      fullAccessLevel: RecordShareAccessLevel.FULL,
      rowCauses: [RecordShareRowCause.OWNER, RecordShareRowCause.MANUAL],
    };
    const isDepartingMemberShare = (alias: string) =>
      `${alias}."objectMetadataId" = ANY(:objectMetadataIds) AND ${alias}."principalType" = :principalType AND ${alias}."principalId" = :fromWorkspaceMemberId AND ${alias}."rowCause" = ANY(:rowCauses) AND ${alias}."deletedAt" IS NULL`;

    await this.workspaceQueryExecutorService.runInTransaction(
      async (executor) => {
        if (isDefined(toWorkspaceMemberId)) {
          await executor.execute(
            compileNamedParameters(
              `INSERT INTO ${recordShareTable} ("objectMetadataId", "recordId", "principalType", "principalId", "accessLevel", "rowCause", "sourceId")
               SELECT departing."objectMetadataId", departing."recordId", departing."principalType", :toWorkspaceMemberId, departing."accessLevel", departing."rowCause", departing."sourceId"
               FROM ${recordShareTable} AS departing
               WHERE ${isDepartingMemberShare('departing')} AND departing."accessLevel" = :fullAccessLevel
               ON CONFLICT DO NOTHING`,
              parameters,
            ),
          );

          // The insert skips the rows the custodian already holds on these
          // records, which are raised to full access instead
          await executor.execute(
            compileNamedParameters(
              `UPDATE ${recordShareTable} AS custodian
               SET "accessLevel" = :fullAccessLevel, "updatedAt" = NOW()
               FROM ${recordShareTable} AS departing
               WHERE ${isDepartingMemberShare('departing')} AND departing."accessLevel" = :fullAccessLevel
                 AND custodian."objectMetadataId" = departing."objectMetadataId"
                 AND custodian."recordId" = departing."recordId"
                 AND custodian."rowCause" = departing."rowCause"
                 AND custodian."principalType" = :principalType
                 AND custodian."principalId" = :toWorkspaceMemberId
                 AND custodian."accessLevel" <> :fullAccessLevel
                 AND custodian."deletedAt" IS NULL`,
              parameters,
            ),
          );
        }

        await executor.execute(
          compileNamedParameters(
            `DELETE FROM ${recordShareTable} AS departing WHERE ${isDepartingMemberShare('departing')}`,
            parameters,
          ),
        );
      },
    );
  }

  async setRecordsPrivate({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    isPrivate,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    isPrivate: boolean;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.executeQuery({
      workspaceId,
      transactionScope,
      query: {
        sql: `UPDATE ${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(flatObjectMetadata),
        })} SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = :isPrivate WHERE "id" = ANY(:recordIds)`,
        parameters: { isPrivate, recordIds },
      },
    });
  }

  private executeQuery<
    TRow extends Record<string, unknown> = Record<string, unknown>,
  >({
    workspaceId,
    transactionScope,
    query,
  }: {
    workspaceId: string;
    transactionScope?: WorkspaceTransactionScope;
    query: RecordPermissionQuery;
  }): Promise<TRow[]> {
    const statement = compileNamedParameters(query.sql, query.parameters);

    if (!isDefined(transactionScope)) {
      return this.workspaceQueryExecutorService
        .getPrimaryQueryExecutorOrThrow()
        .execute<TRow>(statement);
    }

    if (transactionScope.workspaceId !== workspaceId) {
      throw new RecordShareException(
        `Transaction scope of workspace ${transactionScope.workspaceId} cannot read record permission data of workspace ${workspaceId}`,
        RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
      );
    }

    return transactionScope.executeRawQuery<TRow>(
      statement.text,
      statement.values,
    );
  }
}
