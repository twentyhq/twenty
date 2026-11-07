/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/access-group/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildRecordAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-access-group-ids-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordAccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  // Returns the last record id of the batch, or null once no record is left
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
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const accessGroupIdsColumn = escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME);
    const alias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);

    // Rows whose groups did not change are not rewritten
    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      query: {
        sql: `WITH "recordAccessGroupBatch" AS (
            SELECT ${alias}."id", ${buildRecordAccessGroupIdsExpression({ recordAccessGroupConditions })} AS "accessGroupIds"
            FROM ${tableExpression} AS ${alias}
            ${isDefined(afterRecordId) ? `WHERE ${alias}."id" > :afterRecordId` : ''}
            ORDER BY ${alias}."id"
            LIMIT :batchSize
          ), "recordAccessGroupUpdate" AS (
            UPDATE ${tableExpression} AS ${alias}
            SET ${accessGroupIdsColumn} = "recordAccessGroupBatch"."accessGroupIds"
            FROM "recordAccessGroupBatch"
            WHERE ${alias}."id" = "recordAccessGroupBatch"."id"
              AND ${alias}.${accessGroupIdsColumn} IS DISTINCT FROM "recordAccessGroupBatch"."accessGroupIds"
          )
          SELECT "id" FROM "recordAccessGroupBatch" ORDER BY "id" DESC LIMIT 1`,
        parameters: {
          afterRecordId,
          batchSize,
          ...Object.assign(
            {},
            ...recordAccessGroupConditions.map(
              ({ condition }) => condition?.parameters ?? {},
            ),
          ),
        },
      },
    });

    return rows[0]?.id ?? null;
  }
}
