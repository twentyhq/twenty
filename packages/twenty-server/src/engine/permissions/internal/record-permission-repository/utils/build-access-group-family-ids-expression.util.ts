/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupFamily } from 'src/engine/permissions/internal/access-group/types/access-group-family.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildAccessGroupFamilyIdsExpression = ({
  workspaceId,
  tableAlias,
  family,
  familyIndex,
  residualMemberFieldValues,
  residualSQLCondition,
}: {
  workspaceId: string;
  tableAlias: string;
  family: AccessGroupFamily;
  familyIndex: number;
  residualMemberFieldValues: RlsMemberFieldValues;
  residualSQLCondition: SQLCondition | null;
}): SQLCondition => {
  const parameterName = (name: string) =>
    `accessGroupFamily${familyIndex}_${name}`;
  const accessGroupAlias = escapeIdentifier(
    `access_group_family_${familyIndex}`,
  );
  const quotedTableAlias = escapeIdentifier(tableAlias);

  const keyLookups = family.keys.map((key, keyIndex) => {
    if (!isDefined(key.relationHop)) {
      return {
        valueExpression: `${quotedTableAlias}.${escapeIdentifier(key.columnName)}`,
        fromExpressions: [],
        joinConditions: [],
      };
    }

    const hopAlias = escapeIdentifier(
      `access_group_family_${familyIndex}_${keyIndex}`,
    );

    return {
      valueExpression: `${hopAlias}.${escapeIdentifier(key.columnName)}`,
      fromExpressions: [
        `${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(
            key.relationHop.targetFlatObjectMetadata,
          ),
        })} AS ${hopAlias}`,
      ],
      joinConditions: [
        `${hopAlias}.${escapeIdentifier(key.relationHop.targetColumnName)} = ${quotedTableAlias}.${escapeIdentifier(key.relationHop.sourceColumnName)}`,
        `${hopAlias}."deletedAt" IS NULL`,
      ],
    };
  });
  const hasResidualMemberFieldValues =
    Object.keys(residualMemberFieldValues).length > 0;
  const memberFieldValuesExpression = [
    `jsonb_build_object(${keyLookups
      .map(
        ({ valueExpression }, keyIndex) =>
          `CAST(:${parameterName(`key${keyIndex}`)} AS text), ${valueExpression}`,
      )
      .join(', ')})`,
    ...(hasResidualMemberFieldValues
      ? [`CAST(:${parameterName('residual')} AS jsonb)`]
      : []),
  ].join(' || ');

  const lookupSql = `ARRAY(SELECT ${accessGroupAlias}."compactId" FROM ${[
    ...keyLookups.flatMap(({ fromExpressions }) => fromExpressions),
    `${buildAccessGroupTableExpression(workspaceId)} AS ${accessGroupAlias}`,
  ].join(', ')} WHERE ${[
    ...keyLookups.flatMap(({ joinConditions }) => joinConditions),
    ...keyLookups.map(
      ({ valueExpression }) => `${valueExpression} IS NOT NULL`,
    ),
    `${accessGroupAlias}."rowLevelPermissionPredicateGroupId" = :${parameterName('ruleId')}`,
    `${accessGroupAlias}."roleId" = :${parameterName('roleId')}`,
    `${accessGroupAlias}."objectMetadataId" = :${parameterName('objectMetadataId')}`,
    `${accessGroupAlias}."memberFieldValues" = ${memberFieldValuesExpression}`,
  ].join(' AND ')})`;

  return {
    sql: isDefined(residualSQLCondition)
      ? `CASE WHEN (${residualSQLCondition.sql}) THEN ${lookupSql} ELSE CAST('{}' AS integer[]) END`
      : lookupSql,
    parameters: {
      ...residualSQLCondition?.parameters,
      ...Object.fromEntries(
        family.keys.map(({ memberFieldKey }, keyIndex) => [
          parameterName(`key${keyIndex}`),
          memberFieldKey,
        ]),
      ),
      ...(hasResidualMemberFieldValues
        ? {
            [parameterName('residual')]: JSON.stringify(
              residualMemberFieldValues,
            ),
          }
        : {}),
      [parameterName('ruleId')]: family.ruleId,
      [parameterName('roleId')]: family.roleId,
      [parameterName('objectMetadataId')]: family.objectMetadataId,
    },
  };
};
