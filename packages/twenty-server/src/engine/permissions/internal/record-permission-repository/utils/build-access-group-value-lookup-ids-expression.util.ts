/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup.type';
import { findAccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/utils/find-access-group-type-handler.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { buildRlsRuleSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-rls-rule-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type KeyValueExpression = {
  valueExpression: string;
  fromExpressions: string[];
  joinConditions: string[];
};

export const buildAccessGroupValueLookupIdsExpression = ({
  workspaceId,
  flatObjectMetadata,
  metadataMaps,
  lookup,
  lookupIndex,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
  lookup: AccessGroupValueLookup;
  lookupIndex: number;
}): SQLCondition => {
  const residualSQLCondition = buildRlsRuleSQLCondition({
    rowLevelPermissionRule: lookup.residualRule,
    memberFieldValues: {},
    flatObjectMetadata,
    tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
    metadataMaps,
  });
  const parameterName = (name: string) =>
    `accessGroupValueLookup${lookupIndex}_${name}`;
  const accessGroupAlias = escapeIdentifier(
    `access_group_value_lookup_${lookupIndex}`,
  );
  const quotedTableAlias = escapeIdentifier(RECORD_ACCESS_GROUP_TABLE_ALIAS);

  const keyValueExpressions: KeyValueExpression[] = lookup.keys.map(
    (key, keyIndex) => {
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
    },
  );

  const lookupSql = `ARRAY(SELECT ${accessGroupAlias}."compactId" FROM ${[
    ...keyValueExpressions.flatMap(({ fromExpressions }) => fromExpressions),
    `${buildAccessGroupTableExpression(workspaceId)} AS ${accessGroupAlias}`,
  ].join(', ')} WHERE ${[
    ...keyValueExpressions.flatMap(({ joinConditions }) => joinConditions),
    ...keyValueExpressions.map(
      ({ valueExpression }) => `${valueExpression} IS NOT NULL`,
    ),
    `${accessGroupAlias}."type" = '${lookup.type}'`,
    `${accessGroupAlias}."ruleShapeHash" = :${parameterName('ruleShapeHash')}`,
    findAccessGroupTypeHandler(lookup.type).buildValueLookupCondition({
      accessGroupAlias,
      valueExpressions: keyValueExpressions.map(
        ({ valueExpression }) => valueExpression,
      ),
      buildKeyParameterName: (keyIndex) => parameterName(`key${keyIndex}`),
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
