/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/record-permission-orm/services/record-permission-query.service';
import { type PrivateRecordStateRow } from 'src/engine/permissions/record-permission-orm/types/private-record-state-row.type';
import { buildFindPrivateRecordStatesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-find-private-record-states-query.util';
import { buildFindRecordSharesQuery } from 'src/engine/permissions/record-permission-orm/utils/build-find-record-shares-query.util';
import { buildRecordShareTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-record-share-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-workspace-table-expression.util';
import { indexPrivateRecordStatesByRecordId } from 'src/engine/permissions/record-permission-orm/utils/index-private-record-states-by-record-id.util';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/record-permission-orm/types/record-permission-transaction-scope.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordPermissionReadOrmService {
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
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Map<string, PrivateRecordState>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const rows =
      await this.recordPermissionQueryService.execute<PrivateRecordStateRow>({
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
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Set<string>> {
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const tableAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
    const conditionClause = isObject(condition)
      ? ` AND (${condition.sql})`
      : '';

    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
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
}
