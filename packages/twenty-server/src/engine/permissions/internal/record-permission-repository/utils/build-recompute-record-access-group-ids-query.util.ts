/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';
import { buildRecordAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-access-group-ids-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecomputeRecordAccessGroupIdsQuery = ({
  workspaceId,
  flatObjectMetadata,
  recordAccessGroupSQLConditions,
  recordIds,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
  recordIds: string[];
}): SQLCondition => {
  const tableExpression = buildWorkspaceTableExpression({
    workspaceId,
    tableName: computeObjectTargetTable(flatObjectMetadata),
  });
  const accessGroupIdsColumn = escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME);
  const alias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);

  return {
    sql: `UPDATE ${tableExpression} AS ${alias}
      SET ${accessGroupIdsColumn} = "recomputed"."accessGroupIds"
      FROM (
        SELECT ${alias}."id", ${buildRecordAccessGroupIdsExpression({ recordAccessGroupSQLConditions })} AS "accessGroupIds"
        FROM ${tableExpression} AS ${alias}
        WHERE ${alias}."id" = ANY(:recordIds)
      ) AS "recomputed"
      WHERE ${alias}."id" = "recomputed"."id"
        AND ${alias}.${accessGroupIdsColumn} IS DISTINCT FROM "recomputed"."accessGroupIds"`,
    parameters: Object.assign(
      { recordIds },
      ...recordAccessGroupSQLConditions.map(
        ({ sqlCondition }) => sqlCondition?.parameters ?? {},
      ),
    ),
  };
};
