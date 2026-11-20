/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { type RelatedRecordPathAccessGroupSource } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-access-group-source.type';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const INHERITED_ACCESS_GROUP_ID = '"inherited"."accessGroupId"';

export const buildInheritedAccessGroupIdsExpression = ({
  workspaceId,
  targetTableAlias,
  pathIndex,
  relatedRecordPathAccessGroupSource: {
    hops,
    sourceObjectCompactIds,
    roleIdsUnableToReadRelation,
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
  const hopsJoin = buildRelatedRecordPathHopsJoin({
    workspaceId,
    hops,
    hopTableAliases,
    targetTableAlias,
  });
  const fromExpressions = [
    ...hopsJoin.fromExpressions,
    `unnest(${escapeIdentifier(sourceTableAlias)}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)}) AS "inherited"("accessGroupId")`,
  ];
  const sourceCompactIdsParameterName = `relatedRecordPathSourceCompactIds_${pathIndex}`;
  const roleIdsUnableToReadRelationParameterName = `relatedRecordPathRoleIdsUnableToReadRelation_${pathIndex}`;
  const whereConditions = [
    ...hopTableAliases.flatMap((hopTableAlias, hopIndex) => [
      hopsJoin.joinConditions[hopIndex],
      `${escapeIdentifier(hopTableAlias)}."deletedAt" IS NULL`,
    ]),
    ...(isSourcePrivacyApplicable
      ? [
          buildPrivateRecordStateSQLCondition({
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
    ...(isNonEmptyArray(roleIdsUnableToReadRelation)
      ? [
          `NOT EXISTS (SELECT 1 FROM ${buildAccessGroupTableExpression(workspaceId)} AS "inheritedAccessGroup" WHERE "inheritedAccessGroup"."compactId" = ${INHERITED_ACCESS_GROUP_ID} AND "inheritedAccessGroup"."roleId" = ANY(CAST(:${roleIdsUnableToReadRelationParameterName} AS uuid[])))`,
        ]
      : []),
  ];

  return {
    sql: `ARRAY(SELECT ${INHERITED_ACCESS_GROUP_ID} FROM ${fromExpressions.join(', ')} WHERE ${whereConditions.join(' AND ')})`,
    parameters: {
      ...(isDefined(sourceObjectCompactIds)
        ? { [sourceCompactIdsParameterName]: sourceObjectCompactIds }
        : {}),
      ...(isNonEmptyArray(roleIdsUnableToReadRelation)
        ? {
            [roleIdsUnableToReadRelationParameterName]:
              roleIdsUnableToReadRelation,
          }
        : {}),
    },
  };
};
