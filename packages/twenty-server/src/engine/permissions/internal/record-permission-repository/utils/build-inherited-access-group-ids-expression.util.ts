/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { ACCESS_GROUP_SHARED_PREDICATE_KEY } from 'src/engine/permissions/internal/access-group/constants/access-group-shared-predicate-key.constant';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findRolesAndRulesUnableToReadField } from 'src/engine/permissions/internal/access-group/utils/find-roles-and-rules-unable-to-read-field.util';
import { buildPrivateRecordStateSQLCondition } from 'src/engine/permissions/internal/private-record/utils/build-private-record-state-sql-condition.util';
import { isPrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/is-private-records-enabled.util';
import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { buildRelatedRecordPathHopsJoin } from 'src/engine/permissions/internal/record-permission-repository/utils/build-related-record-path-hops-join.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const INHERITED_ACCESS_GROUP_ID = '"inherited"."accessGroupId"';

export const buildInheritedAccessGroupIdsExpression = ({
  workspaceId,
  targetTableAlias,
  pathIndex,
  resolvedPath: { hops, isInherent, sourceFlatObjectMetadata },
  accessGroups,
  metadataMaps,
}: {
  workspaceId: string;
  targetTableAlias: string;
  pathIndex: number;
  resolvedPath: Pick<
    ResolvedRelatedRecordPath,
    'hops' | 'isInherent' | 'sourceFlatObjectMetadata'
  >;
  accessGroups: AccessGroup[];
  metadataMaps: Pick<
    RecordAccessGroupComputationMetadataMaps,
    'rolesPermissions' | 'featureFlagsMap'
  >;
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
  const sourceCompactIdsParameterName = `relatedRecordPathSourceCompactIds_${pathIndex}`;
  const roleIdsUnableToReadRelationParameterName = `relatedRecordPathRoleIdsUnableToReadRelation_${pathIndex}`;
  const ruleIdsUnableToReadRelationParameterName = `relatedRecordPathRuleIdsUnableToReadRelation_${pathIndex}`;
  const relationFieldMetadataIdParameterName = `relatedRecordPathRelationFieldMetadataId_${pathIndex}`;
  const sourceCompactIds = accessGroups
    .filter(
      ({ objectMetadataId }) =>
        objectMetadataId === sourceFlatObjectMetadata.id,
    )
    .map(({ compactId }) => compactId);
  const {
    roleIds: roleIdsUnableToReadRelation,
    ruleIds: ruleIdsUnableToReadRelation,
  } = findRolesAndRulesUnableToReadField({
    rolesPermissions: metadataMaps.rolesPermissions,
    objectMetadataId: sourceFlatObjectMetadata.id,
    fieldMetadataId: hops[0].relationFieldMetadataId,
  });
  const isRelationUnreadable =
    isNonEmptyArray(roleIdsUnableToReadRelation) ||
    isNonEmptyArray(ruleIdsUnableToReadRelation);

  const whereConditions = [
    ...hopTableAliases.flatMap((hopTableAlias, hopIndex) => [
      hopsJoin.joinConditions[hopIndex],
      `${escapeIdentifier(hopTableAlias)}."deletedAt" IS NULL`,
    ]),
    ...(isPrivateRecordsEnabled({
      flatObjectMetadata: sourceFlatObjectMetadata,
      featureFlagsMap: metadataMaps.featureFlagsMap,
    })
      ? [
          buildPrivateRecordStateSQLCondition({
            tableAlias: sourceTableAlias,
            isPrivate: false,
          }).sql,
        ]
      : []),
    ...(isInherent
      ? []
      : [
          `${INHERITED_ACCESS_GROUP_ID} = ANY(CAST(:${sourceCompactIdsParameterName} AS integer[]))`,
        ]),
    ...(isRelationUnreadable
      ? [
          // a shared group may outlive the role it was stored with, so it is matched by the fields it cannot read
          `NOT EXISTS (SELECT 1 FROM ${buildAccessGroupTableExpression(workspaceId)} AS "inheritedAccessGroup" WHERE "inheritedAccessGroup"."compactId" = ${INHERITED_ACCESS_GROUP_ID} AND CASE WHEN "inheritedAccessGroup"."memberFieldValues" -> '${ACCESS_GROUP_SHARED_PREDICATE_KEY}' IS NOT NULL THEN "inheritedAccessGroup"."memberFieldValues" -> '${ACCESS_GROUP_SHARED_PREDICATE_KEY}' -> 'unreadableFieldIds' @> jsonb_build_array(CAST(:${relationFieldMetadataIdParameterName} AS text)) ELSE "inheritedAccessGroup"."roleId" = ANY(CAST(:${roleIdsUnableToReadRelationParameterName} AS uuid[])) OR "inheritedAccessGroup"."rowLevelPermissionPredicateGroupId" = ANY(CAST(:${ruleIdsUnableToReadRelationParameterName} AS uuid[])) END)`,
        ]
      : []),
  ];

  return {
    sql: `ARRAY(SELECT ${INHERITED_ACCESS_GROUP_ID} FROM ${[
      ...hopsJoin.fromExpressions,
      `unnest(${escapeIdentifier(sourceTableAlias)}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)}) AS "inherited"("accessGroupId")`,
    ].join(', ')} WHERE ${whereConditions.join(' AND ')})`,
    parameters: {
      ...(isInherent
        ? {}
        : { [sourceCompactIdsParameterName]: sourceCompactIds }),
      ...(isRelationUnreadable
        ? {
            [roleIdsUnableToReadRelationParameterName]:
              roleIdsUnableToReadRelation,
            [ruleIdsUnableToReadRelationParameterName]:
              ruleIdsUnableToReadRelation,
            [relationFieldMetadataIdParameterName]:
              hops[0].relationFieldMetadataId,
          }
        : {}),
    },
  };
};
