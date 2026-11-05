/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RECORD_SHARE_TABLE_NAME } from 'src/engine/permissions/record-permission-orm/constants/record-share-table-name.constant';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-workspace-table-expression.util';
import { executeRecordPermissionQuery } from 'src/engine/permissions/record-permission-orm/utils/execute-record-permission-query.util';
import { findPrivateRecordStates } from 'src/engine/permissions/record-permission-orm/utils/find-private-record-states.util';
import { findRecordIdsMatchingCondition } from 'src/engine/permissions/record-permission-orm/utils/find-record-ids-matching-condition.util';
import { findRecordShareGrants } from 'src/engine/permissions/record-permission-orm/utils/find-record-share-grants.util';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class RecordPermissionOrmService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  buildRecordShareTableExpression({
    workspaceId,
  }: {
    workspaceId: string;
  }): string {
    return buildWorkspaceTableExpression({
      workspaceId,
      tableName: RECORD_SHARE_TABLE_NAME,
    });
  }

  findRecordShareGrants({
    workspaceId,
    objectMetadataId,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<RecordShareGrant[]> {
    return findRecordShareGrants({
      executor: this.resolveQueryExecutor(transactionScope),
      recordShareTableExpression: this.buildRecordShareTableExpression({
        workspaceId,
      }),
      objectMetadataId,
      recordIds,
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

    const rows = await executeRecordPermissionQuery<{
      objectMetadataId: string;
      accessLevel: RecordShareAccessLevel;
    }>({
      executor: this.resolveQueryExecutor(),
      sql: `SELECT DISTINCT "objectMetadataId", "accessLevel" FROM ${this.buildRecordShareTableExpression({ workspaceId })} WHERE "principalId" = ANY(:principalIds) AND "deletedAt" IS NULL`,
      parameters: { principalIds },
    });

    return rows.reduce((accessLevelsByObjectMetadataId, row) => {
      accessLevelsByObjectMetadataId.set(row.objectMetadataId, [
        ...(accessLevelsByObjectMetadataId.get(row.objectMetadataId) ?? []),
        row.accessLevel,
      ]);

      return accessLevelsByObjectMetadataId;
    }, new Map<string, RecordShareAccessLevel[]>());
  }

  findPrivateRecordStates({
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
    return findPrivateRecordStates({
      executor: this.resolveQueryExecutor(transactionScope),
      tableExpression: buildWorkspaceTableExpression({
        workspaceId,
        tableName: computeObjectTargetTable(flatObjectMetadata),
      }),
      flatObjectMetadata,
      flatFieldMetadataMaps,
      recordIds,
    });
  }

  findRecordIdsMatchingCondition({
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
    return findRecordIdsMatchingCondition({
      executor: this.resolveQueryExecutor(transactionScope),
      tableExpression: buildWorkspaceTableExpression({
        workspaceId,
        tableName: computeObjectTargetTable(flatObjectMetadata),
      }),
      tableAlias: flatObjectMetadata.nameSingular,
      recordIds,
      condition,
    });
  }

  private resolveQueryExecutor(
    transactionScope?: WorkspaceTransactionScope,
  ): QueryExecutor {
    return isDefined(transactionScope)
      ? {
          execute: ({ text, values }) =>
            transactionScope.executeRawQuery(text, values),
        }
      : this.workspaceOrmManager.getPrimaryQueryExecutor();
  }
}
