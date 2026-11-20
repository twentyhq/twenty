/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

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
    sourceObjectMetadataId,
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
  const sourceObjectMetadataIdParameterName = `relatedRecordPathSourceObjectMetadataId_${pathIndex}`;
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
    ...(isDefined(sourceObjectMetadataId)
      ? [
          // ARRAY() keeps it an init plan computed once, an IN subquery lets the planner turn it into a join per record
          `${INHERITED_ACCESS_GROUP_ID} = ANY(ARRAY(SELECT "compactId" FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "objectMetadataId" = :${sourceObjectMetadataIdParameterName}))`,
        ]
      : []),
  ];

  return {
    sql: `ARRAY(SELECT ${INHERITED_ACCESS_GROUP_ID} FROM ${fromExpressions.join(', ')} WHERE ${whereConditions.join(' AND ')})`,
    parameters: isDefined(sourceObjectMetadataId)
      ? { [sourceObjectMetadataIdParameterName]: sourceObjectMetadataId }
      : {},
  };
};
