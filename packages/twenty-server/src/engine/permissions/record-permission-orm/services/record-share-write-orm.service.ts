/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RecordPermissionQueryService } from 'src/engine/permissions/record-permission-orm/services/record-permission-query.service';
import { type RecordShareCriteria } from 'src/engine/permissions/record-permission-orm/types/record-share-criteria.type';
import { buildDeleteRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-delete-record-shares-query.util';
import { buildInsertRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-insert-record-shares-query.util';
import { buildRecordShareTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-record-share-table-expression.util';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import {
  compileNamedParameters,
  type NamedParameters,
} from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

@Injectable()
export class RecordShareWriteOrmService {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
  ) {}

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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
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
}
