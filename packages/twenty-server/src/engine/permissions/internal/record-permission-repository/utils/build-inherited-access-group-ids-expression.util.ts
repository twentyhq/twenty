/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { buildRecordPrivacySQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-sql-condition.util';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { type RelatedRecordPathAccessGroupSource } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-access-group-source.type';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const INHERITED_ACCESS_GROUP_ID = '"inherited"."accessGroupId"';

export const buildInheritedAccessGroupIdsExpression = ({
  workspaceId,
  targetTableAlias,
  pathIndex,
  relatedRecordPathAccessGroupSource: {
    hops,
    sourceObjectCompactIds,
    isSourcePrivacyApplicable,
  },
}: {
  workspaceId: string;
  targetTableAlias: string;
  pathIndex: number;
  relatedRecordPathAccessGroupSource: RelatedRecordPathAccessGroupSource;
}): SQLCondition => {
  const hopTableAliases = hops.map(
    (_, hopIndex) => `related_record_path_${pathIndex}_${hopIndex}`,
  );
  const sourceTableAlias = hopTableAliases[0];
  const nextTableAliases = [...hopTableAliases.slice(1), targetTableAlias];
  const fromExpressions = [
    ...hops.map(
      (hop, hopIndex) =>
        `${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(hop.flatObjectMetadata),
        })} AS ${escapeIdentifier(hopTableAliases[hopIndex])}`,
    ),
    `unnest(${escapeIdentifier(sourceTableAlias)}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)}) AS "inherited"("accessGroupId")`,
  ];
  const sourceCompactIdsParameterName = `relatedRecordPathSourceCompactIds_${pathIndex}`;
  const whereConditions = [
    ...hops.flatMap((hop, hopIndex) => [
      `${escapeIdentifier(nextTableAliases[hopIndex])}.${escapeIdentifier(hop.targetColumnName)} = ${escapeIdentifier(hopTableAliases[hopIndex])}.${escapeIdentifier(hop.sourceColumnName)}`,
      `${escapeIdentifier(hopTableAliases[hopIndex])}."deletedAt" IS NULL`,
    ]),
    ...(isSourcePrivacyApplicable
      ? [
          buildRecordPrivacySQLCondition({
            tableAlias: sourceTableAlias,
            isPrivate: false,
          }).sql,
        ]
      : []),
    ...(isDefined(sourceObjectCompactIds)
      ? [
          `${INHERITED_ACCESS_GROUP_ID} = ANY(CAST(:${sourceCompactIdsParameterName} AS integer[]))`,
        ]
      : []),
  ];

  return {
    sql: `ARRAY(SELECT ${INHERITED_ACCESS_GROUP_ID} FROM ${fromExpressions.join(', ')} WHERE ${whereConditions.join(' AND ')})`,
    parameters: isDefined(sourceObjectCompactIds)
      ? { [sourceCompactIdsParameterName]: sourceObjectCompactIds }
      : {},
  };
};
