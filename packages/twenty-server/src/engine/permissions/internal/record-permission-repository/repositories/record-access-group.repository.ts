/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';
import { buildRecomputeRecordAccessGroupIdsQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-recompute-record-access-group-ids-query.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const RECORD_ID_COLUMN = `${escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS)}."id"`;

@Injectable()
export class RecordAccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async recomputeRecordAccessGroupIdsBatch({
    workspaceId,
    flatObjectMetadata,
    recordAccessGroupConditions,
    afterRecordId,
    batchSize,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordAccessGroupConditions: RecordAccessGroupCondition[];
    afterRecordId: string | null;
    batchSize: number;
  }): Promise<string | null> {
    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      query: buildRecomputeRecordAccessGroupIdsQuery({
        workspaceId,
        flatObjectMetadata,
        recordAccessGroupConditions,
        recordSelection: isDefined(afterRecordId)
          ? {
              sql: `${RECORD_ID_COLUMN} > :afterRecordId`,
              parameters: { afterRecordId },
            }
          : null,
        limit: batchSize,
      }),
    });

    return rows[0]?.id ?? null;
  }

  async recomputeRecordAccessGroupIdsOfRecords({
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
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      transactionScope,
      query: buildRecomputeRecordAccessGroupIdsQuery({
        workspaceId,
        flatObjectMetadata,
        recordAccessGroupConditions,
        recordSelection: {
          sql: `${RECORD_ID_COLUMN} = ANY(:recordIds)`,
          parameters: { recordIds },
        },
        limit: null,
      }),
    });
  }
}
