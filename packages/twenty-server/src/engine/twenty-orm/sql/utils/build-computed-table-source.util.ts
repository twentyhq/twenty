import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import {
  type WorkspaceComputedColumnShape,
  type WorkspaceTableShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import {
  quoteColumn,
  quoteTable,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { renderUnreadableColumn } from 'src/engine/twenty-orm/sql/utils/render-unreadable-column.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type ComputedTableSourcePermissions = {
  // false when no record behind the lookup can be read
  lookupAccessConditionByAlias: Partial<Record<string, string | false>>;
  unreadableFieldConditions: {
    alias: string;
    fieldMetadataIds: string[];
    condition: string;
  }[];
};

type ComputedLookup = {
  alias: string;
  joinColumnName: string;
  targetTableShape: WorkspaceTableShape;
};

const renderComputedColumn = ({
  computedColumnShape: { columnName, sqlType, expression, dependencies },
  lookups,
  recordReadRestrictions,
  permissions,
}: {
  computedColumnShape: WorkspaceComputedColumnShape;
  lookups: ComputedLookup[];
  recordReadRestrictions: RecordReadRestrictions;
  permissions: ComputedTableSourcePermissions | undefined;
}): { sql: string; lookupAliases: string[] } => {
  const lookupAliases = [
    ...new Set(
      dependencies
        .map(({ alias }) => alias)
        .filter((alias) => alias !== COMPUTED_COLUMN_RECORD_ALIAS),
    ),
  ];
  const isUnreadable =
    dependencies.some(({ fieldMetadataId }) =>
      recordReadRestrictions.unreadableFieldMetadataIds.has(fieldMetadataId),
    ) ||
    lookupAliases.some((lookupAlias) => {
      const lookup = lookups.find(({ alias }) => alias === lookupAlias);

      return (
        !isDefined(lookup) ||
        permissions?.lookupAccessConditionByAlias[lookupAlias] === false ||
        recordReadRestrictions.unreadableObjectMetadataIds.has(
          lookup.targetTableShape.objectMetadataId,
        )
      );
    });

  if (!isDefined(expression) || isUnreadable) {
    return {
      sql: `NULL::${sqlType} AS ${escapeIdentifier(columnName)}`,
      lookupAliases: [],
    };
  }

  const unreadableConditions = (permissions?.unreadableFieldConditions ?? [])
    .filter(({ alias, fieldMetadataIds }) =>
      dependencies.some(
        (dependency) =>
          dependency.alias === alias &&
          fieldMetadataIds.includes(dependency.fieldMetadataId),
      ),
    )
    .map(({ condition }) => condition);
  const readableExpression = isNonEmptyArray(unreadableConditions)
    ? renderUnreadableColumn({ quotedColumn: expression, unreadableConditions })
    : expression;

  return {
    sql: `(${readableExpression})::${sqlType} AS ${escapeIdentifier(columnName)}`,
    lookupAliases,
  };
};

// A value read through a record or a field the caller cannot read is NULL
export const buildComputedTableSource = ({
  tableShape,
  getTableShape,
  recordReadRestrictions,
  permissions,
}: {
  tableShape: WorkspaceTableShape;
  getTableShape: (objectMetadataId: string) => WorkspaceTableShape;
  recordReadRestrictions: RecordReadRestrictions;
  permissions: ComputedTableSourcePermissions | undefined;
}): string | undefined => {
  const computedColumnShapes = tableShape.computedColumnShapes ?? [];

  if (computedColumnShapes.length === 0) {
    return undefined;
  }

  const lookups = (tableShape.computedLookupShapes ?? []).flatMap(
    ({ alias, relationFieldName }): ComputedLookup[] => {
      const relationShape =
        tableShape.relationShapeByFieldName[relationFieldName];

      return isDefined(relationShape?.joinColumnName)
        ? [
            {
              alias,
              joinColumnName: relationShape.joinColumnName,
              targetTableShape: getTableShape(
                relationShape.targetObjectMetadataId,
              ),
            },
          ]
        : [];
    },
  );
  const computedColumns = computedColumnShapes.map((computedColumnShape) =>
    renderComputedColumn({
      computedColumnShape,
      lookups,
      recordReadRestrictions,
      permissions,
    }),
  );
  const computedColumnNames = new Set(
    computedColumnShapes.map(({ columnName }) => columnName),
  );
  const storedColumnNames = tableShape.columnNames.filter(
    (columnName) => !computedColumnNames.has(columnName),
  );

  if (tableShape.hasAccessGroupIdsColumn === true) {
    storedColumnNames.push(ACCESS_GROUP_IDS_COLUMN_NAME);
  }

  const storedColumns = storedColumnNames.map((columnName) =>
    quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, columnName),
  );
  const joinedLookupAliases = new Set(
    computedColumns.flatMap(({ lookupAliases }) => lookupAliases),
  );
  const joins = lookups
    .filter(({ alias }) => joinedLookupAliases.has(alias))
    .map(({ alias, joinColumnName, targetTableShape }) => {
      const accessCondition = permissions?.lookupAccessConditionByAlias[alias];
      const conditions = [
        `${quoteColumn(alias, 'id')} = ${quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, joinColumnName)}`,
        targetTableShape.hasDeletedAtColumn
          ? `${quoteColumn(alias, 'deletedAt')} IS NULL`
          : undefined,
        isDefined(accessCondition) && accessCondition !== false
          ? `(${accessCondition})`
          : undefined,
      ].filter(isDefined);

      return `LEFT JOIN ${quoteTable(targetTableShape)} AS ${escapeIdentifier(alias)} ON ${conditions.join(' AND ')}`;
    });

  return `(${[
    `SELECT ${[...storedColumns, ...computedColumns.map(({ sql }) => sql)].join(', ')}`,
    `FROM ${quoteTable(tableShape)} AS ${escapeIdentifier(COMPUTED_COLUMN_RECORD_ALIAS)}`,
    ...joins,
  ].join(' ')})`;
};
