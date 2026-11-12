/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordShareCriteria } from 'src/engine/permissions/internal/record-permission-repository/types/record-share-criteria.type';
import { buildDeleteRecordSharesQueryOrThrow } from 'src/engine/permissions/internal/record-permission-repository/utils/build-delete-record-shares-query-or-throw.util';
import { buildInsertRecordSharesQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-insert-record-shares-query.util';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-share-table-expression.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { buildRecordShareLockKey } from 'src/engine/permissions/record-share/utils/build-record-share-lock-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { toPermissionsException } from 'src/engine/permissions/internal/record-permission-repository/utils/to-permissions-exception.util';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import {
  compileNamedParameters,
  type NamedParameters,
} from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

@Injectable()
export class RecordShareRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
  ) {}

  async lockRecordForSharingChange({
    workspaceId,
    flatObjectMetadata,
    recordId,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordId: string;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: {
        sql: 'SELECT pg_advisory_xact_lock(hashtextextended(:lockKey, 0))',
        parameters: {
          lockKey: buildRecordShareLockKey({
            workspaceId,
            objectMetadataId: flatObjectMetadata.id,
            recordId,
          }),
        },
      },
    });
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT "id" FROM ${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(flatObjectMetadata),
        })} WHERE "id" = :recordId FOR UPDATE`,
        parameters: { recordId },
      },
    });
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
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    if (recordShares.length === 0) {
      return;
    }

    await this.recordPermissionQueryService.execute({
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
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: buildDeleteRecordSharesQueryOrThrow({
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
    await this.recordPermissionQueryService.execute({
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

    try {
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

            // The insert skips rows the successor already holds, so raise those
            await executor.execute(
              compileNamedParameters(
                `UPDATE ${recordShareTable} AS successor
                 SET "accessLevel" = :fullAccessLevel, "updatedAt" = NOW()
                 FROM ${recordShareTable} AS departing
                 WHERE ${isDepartingMemberShare('departing')} AND departing."accessLevel" = :fullAccessLevel
                   AND successor."objectMetadataId" = departing."objectMetadataId"
                   AND successor."recordId" = departing."recordId"
                   AND successor."rowCause" = departing."rowCause"
                   AND successor."principalType" = :principalType
                   AND successor."principalId" = :toWorkspaceMemberId
                   AND successor."accessLevel" <> :fullAccessLevel
                   AND successor."deletedAt" IS NULL`,
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
    } catch (error) {
      throw toPermissionsException(error);
    }
  }
}
