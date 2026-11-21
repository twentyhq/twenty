/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup.type';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type KeyLookup = {
  valueExpression: string;
  fromExpressions: string[];
  joinConditions: string[];
};

const buildMatchingValueCondition = ({
  lookup,
  keyLookups,
  accessGroupAlias,
  parameterName,
}: {
  lookup: AccessGroupValueLookup;
  keyLookups: KeyLookup[];
  accessGroupAlias: string;
  parameterName: (name: string) => string;
}): string => {
  if (lookup.type === 'RLS_LITERAL_VALUE') {
    return `${accessGroupAlias}."value" = CAST(${keyLookups[0].valueExpression} AS varchar)`;
  }

  return `${accessGroupAlias}."memberFieldValues" = jsonb_build_object(${keyLookups
    .map(
      ({ valueExpression }, keyIndex) =>
        `CAST(:${parameterName(`key${keyIndex}`)} AS text), ${valueExpression}`,
    )
    .join(', ')})`;
};

export const buildAccessGroupValueLookupIdsExpression = ({
  workspaceId,
  tableAlias,
  lookup,
  lookupIndex,
  residualSQLCondition,
}: {
  workspaceId: string;
  tableAlias: string;
  lookup: AccessGroupValueLookup;
  lookupIndex: number;
  residualSQLCondition: SQLCondition | null;
}): SQLCondition => {
  const parameterName = (name: string) =>
    `accessGroupValueLookup${lookupIndex}_${name}`;
  const accessGroupAlias = escapeIdentifier(
    `access_group_value_lookup_${lookupIndex}`,
  );
  const quotedTableAlias = escapeIdentifier(tableAlias);

  const keyLookups: KeyLookup[] = lookup.keys.map((key, keyIndex) => {
    if (!isDefined(key.relationHop)) {
      return {
        valueExpression: `${quotedTableAlias}.${escapeIdentifier(key.columnName)}`,
        fromExpressions: [],
        joinConditions: [],
      };
    }

    const hopAlias = escapeIdentifier(
      `access_group_value_lookup_${lookupIndex}_${keyIndex}`,
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

  const lookupSql = `ARRAY(SELECT ${accessGroupAlias}."compactId" FROM ${[
    ...keyLookups.flatMap(({ fromExpressions }) => fromExpressions),
    `${buildAccessGroupTableExpression(workspaceId)} AS ${accessGroupAlias}`,
  ].join(', ')} WHERE ${[
    ...keyLookups.flatMap(({ joinConditions }) => joinConditions),
    ...keyLookups.map(
      ({ valueExpression }) => `${valueExpression} IS NOT NULL`,
    ),
    `${accessGroupAlias}."type" = '${lookup.type}'`,
    `${accessGroupAlias}."ruleShapeHash" = :${parameterName('ruleShapeHash')}`,
    buildMatchingValueCondition({
      lookup,
      keyLookups,
      accessGroupAlias,
      parameterName,
    }),
  ].join(' AND ')})`;

  return {
    sql: isDefined(residualSQLCondition)
      ? `CASE WHEN (${residualSQLCondition.sql}) THEN ${lookupSql} ELSE CAST('{}' AS integer[]) END`
      : lookupSql,
    parameters: {
      ...residualSQLCondition?.parameters,
      ...Object.fromEntries(
        lookup.keys.map(({ memberFieldKey }, keyIndex) => [
          parameterName(`key${keyIndex}`),
          memberFieldKey,
        ]),
      ),
      [parameterName('ruleShapeHash')]: lookup.ruleShapeHash,
    },
  };
};
