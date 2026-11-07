/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/access-group/constants/access-group-column-names.constant';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AccessGroupRecordCondition = {
  compactId: number;
  condition: SqlCondition | null;
};

const buildAccessGroupIdsExpression = (
  accessGroupRecordConditions: AccessGroupRecordCondition[],
): string => {
  if (accessGroupRecordConditions.length === 0) {
    return `CAST('{}' AS integer[])`;
  }

  const compactIdCases = accessGroupRecordConditions.map(
    ({ compactId, condition }) =>
      isDefined(condition)
        ? `CASE WHEN (${condition.sql}) THEN ${compactId} END`
        : `${compactId}`,
  );

  return `ARRAY_REMOVE(CAST(ARRAY[${compactIdCases.join(', ')}] AS integer[]), NULL)`;
};

@Injectable()
export class AccessGroupRecordRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  // Returns the last record id of the batch, or null once no record is left
  async recomputeAccessGroupIdsBatch({
    workspaceId,
    flatObjectMetadata,
    tableAlias,
    accessGroupRecordConditions,
    afterRecordId,
    heldCompactIds,
    batchSize,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    tableAlias: string;
    accessGroupRecordConditions: AccessGroupRecordCondition[];
    afterRecordId: string | null;
    heldCompactIds: number[] | null;
    batchSize: number;
  }): Promise<string | null> {
    const tableExpression = buildWorkspaceTableExpression({
      workspaceId,
      tableName: computeObjectTargetTable(flatObjectMetadata),
    });
    const accessGroupIdsColumn = escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME);
    const alias = escapeIdentifier(tableAlias);
    const batchConditions = [
      ...(isDefined(afterRecordId) ? ['"id" > :afterRecordId'] : []),
      ...(isDefined(heldCompactIds)
        ? [`${accessGroupIdsColumn} && CAST(:heldCompactIds AS integer[])`]
        : []),
    ];

    const rows = await this.recordPermissionQueryService.execute<{
      id: string;
    }>({
      workspaceId,
      query: {
        sql: `WITH "batch" AS (
            SELECT "id" FROM ${tableExpression}
            ${batchConditions.length > 0 ? `WHERE ${batchConditions.join(' AND ')}` : ''}
            ORDER BY "id"
            LIMIT :batchSize
          )
          UPDATE ${tableExpression} AS ${alias}
          SET ${accessGroupIdsColumn} = ${buildAccessGroupIdsExpression(accessGroupRecordConditions)}
          FROM "batch"
          WHERE ${alias}."id" = "batch"."id"
          RETURNING ${alias}."id"`,
        parameters: {
          afterRecordId,
          heldCompactIds,
          batchSize,
          ...Object.assign(
            {},
            ...accessGroupRecordConditions.map(
              ({ condition }) => condition?.parameters ?? {},
            ),
          ),
        },
      },
    });

    if (rows.length === 0) {
      return null;
    }

    return rows.reduce(
      (lastRecordId, { id }) => (id > lastRecordId ? id : lastRecordId),
      rows[0].id,
    );
  }
}
