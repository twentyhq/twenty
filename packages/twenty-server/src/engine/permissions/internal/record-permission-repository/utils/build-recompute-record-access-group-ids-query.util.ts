/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/access-group/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';
import { buildRecordAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-access-group-ids-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Selects the last recomputed record id, so batches can continue after it
export const buildRecomputeRecordAccessGroupIdsQuery = ({
  workspaceId,
  flatObjectMetadata,
  recordAccessGroupConditions,
  recordSelection,
  limit,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  recordAccessGroupConditions: RecordAccessGroupCondition[];
  recordSelection: SqlCondition | null;
  limit: number | null;
}): SqlCondition => {
  const tableExpression = buildWorkspaceTableExpression({
    workspaceId,
    tableName: computeObjectTargetTable(flatObjectMetadata),
  });
  const accessGroupIdsColumn = escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME);
  const alias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);

  return {
    sql: `WITH "recordAccessGroupBatch" AS (
        SELECT ${alias}."id", ${buildRecordAccessGroupIdsExpression({ recordAccessGroupConditions })} AS "accessGroupIds"
        FROM ${tableExpression} AS ${alias}
        ${isDefined(recordSelection) ? `WHERE ${recordSelection.sql}` : ''}
        ORDER BY ${alias}."id"
        ${isDefined(limit) ? 'LIMIT :recordAccessGroupBatchSize' : ''}
      ), "recordAccessGroupUpdate" AS (
        UPDATE ${tableExpression} AS ${alias}
        SET ${accessGroupIdsColumn} = "recordAccessGroupBatch"."accessGroupIds"
        FROM "recordAccessGroupBatch"
        WHERE ${alias}."id" = "recordAccessGroupBatch"."id"
          AND ${alias}.${accessGroupIdsColumn} IS DISTINCT FROM "recordAccessGroupBatch"."accessGroupIds"
      )
      SELECT "id" FROM "recordAccessGroupBatch" ORDER BY "id" DESC LIMIT 1`,
    parameters: Object.assign(
      { recordAccessGroupBatchSize: limit },
      recordSelection?.parameters ?? {},
      ...recordAccessGroupConditions.map(
        ({ condition }) => condition?.parameters ?? {},
      ),
    ),
  };
};
