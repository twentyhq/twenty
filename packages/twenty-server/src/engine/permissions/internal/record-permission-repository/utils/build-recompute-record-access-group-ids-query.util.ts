/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { buildRelatedRecordPathAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-access-group-ids-expression.util';
import { buildRecordAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-access-group-ids-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecomputeRecordAccessGroupIdsQuery = ({
  workspaceId,
  flatObjectMetadata,
  recordAccessGroupSQLConditions,
  accessGroupValueLookupIdsSQLConditions,
  resolvedRelatedRecordPaths,
  accessGroups,
  metadataMaps,
  recordIds,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
  accessGroupValueLookupIdsSQLConditions: SQLCondition[];
  resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  accessGroups: AccessGroup[];
  metadataMaps: Pick<
    RecordAccessGroupComputationMetadataMaps,
    'rolesPermissions' | 'featureFlagsMap'
  >;
  recordIds: string[];
}): SQLCondition => {
  const relatedRecordPathAccessGroupIdsExpressions =
    resolvedRelatedRecordPaths.map((resolvedPath, pathIndex) =>
      buildRelatedRecordPathAccessGroupIdsExpression({
        workspaceId,
        targetTableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
        pathIndex,
        resolvedPath,
        accessGroups,
        metadataMaps,
      }),
    );
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
        SELECT ${alias}."id", ${buildRecordAccessGroupIdsExpression({
          recordAccessGroupSQLConditions,
          accessGroupValueLookupIdsExpressions:
            accessGroupValueLookupIdsSQLConditions.map(({ sql }) => sql),
          relatedRecordPathAccessGroupIdsExpressions:
            relatedRecordPathAccessGroupIdsExpressions.map(({ sql }) => sql),
        })} AS "accessGroupIds"
        FROM ${tableExpression} AS ${alias}
        WHERE ${alias}."id" = ANY(:recordIds)
      ) AS "recomputed"
      WHERE ${alias}."id" = "recomputed"."id"
        AND ${alias}.${accessGroupIdsColumn} IS DISTINCT FROM "recomputed"."accessGroupIds"
      RETURNING ${alias}."id"`,
    parameters: Object.assign(
      { recordIds },
      ...recordAccessGroupSQLConditions.map(
        ({ sqlCondition }) => sqlCondition?.parameters ?? {},
      ),
      ...accessGroupValueLookupIdsSQLConditions.map(
        ({ parameters }) => parameters,
      ),
      ...relatedRecordPathAccessGroupIdsExpressions.map(
        ({ parameters }) => parameters,
      ),
    ),
  };
};
