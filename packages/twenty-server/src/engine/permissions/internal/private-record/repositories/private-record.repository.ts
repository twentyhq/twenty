/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type PrivateRecordStateRow } from 'src/engine/permissions/internal/private-record/types/private-record-state-row.type';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { buildFindPrivateRecordStatesQuery } from 'src/engine/permissions/internal/private-record/utils/build-find-private-record-states-query.util';
import { indexPrivateRecordStatesByRecordId } from 'src/engine/permissions/internal/private-record/utils/index-private-record-states-by-record-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class PrivateRecordRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

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
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.recordPermissionQueryService.execute({
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
}
