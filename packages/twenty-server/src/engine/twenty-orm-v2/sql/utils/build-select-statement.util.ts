import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { buildColumnResultAlias } from 'src/engine/twenty-orm-v2/sql/utils/build-column-result-alias.util';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type FindOptionsLike } from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

export type WhereClause = {
  operator: 'and' | 'or';
  sql: string;
};

export type JoinClause = {
  alias: string;
  targetTableShape: WorkspaceTableShape;
  relationType: RelationType;
  condition?: string;
  toManyForeignKeyColumnName?: string;
  additionalOnConditions: string[];
};

export type SelectClause = {
  expression: string;
  alias: string;
};

export type OrderByClause = {
  expression: string;
  direction: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export type SelectStatementState = {
  alias: string;
  tableShape: WorkspaceTableShape;
  findOptions: FindOptionsLike;
  explicitSelection?: string[];
  extraSelectClauses: SelectClause[];
  joinClauses: JoinClause[];
  whereClauses: WhereClause[];
  groupByExpressions: string[];
  orderByClauses: OrderByClause[];
  includeDeleted: boolean;
  limitValue?: number;
  offsetValue?: number;
};

export const quoteColumn = (alias: string, columnName: string): string =>
  `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

export const normaliseColumnExpression = (
  expression: string,
  defaultAlias: string,
): string => {
  if (expression.includes('"') || expression.includes('(')) {
    return expression;
  }

  const parts = expression.split('.');

  if (parts.length === 2) {
    return quoteColumn(parts[0], parts[1]);
  }

  return quoteColumn(defaultAlias, expression);
};

export const buildProjection = (
  state: SelectStatementState,
): { expressions: string[]; mainAliasColumnNames: string[] } => {
  const selectedColumnNames = Object.entries(state.findOptions.select ?? {})
    .filter(([, isSelected]) => isSelected)
    .map(([columnName]) => columnName);

  for (const columnName of selectedColumnNames) {
    if (!isDefined(state.tableShape.columnShapeByColumnName[columnName])) {
      throw new TwentyOrmV2Exception(
        `Column "${columnName}" does not exist on "${state.tableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
      );
    }
  }

  const mainAliasColumnNames =
    state.explicitSelection ??
    (selectedColumnNames.length > 0
      ? selectedColumnNames
      : state.tableShape.columnNames);

  const expressions = mainAliasColumnNames.map(
    (columnName) =>
      `${quoteColumn(state.alias, columnName)} AS ${escapeIdentifier(
        buildColumnResultAlias(state.alias, columnName),
      )}`,
  );

  for (const extraSelect of state.extraSelectClauses) {
    expressions.push(
      `${extraSelect.expression} AS ${escapeIdentifier(extraSelect.alias)}`,
    );
  }

  return { expressions, mainAliasColumnNames };
};

export const renderUserWhereExpression = (
  whereClauses: WhereClause[],
): string =>
  whereClauses
    .map((clause, index) =>
      index === 0
        ? clause.sql
        : `${clause.operator.toUpperCase()} ${clause.sql}`,
    )
    .join(' ');

export const buildWhereExpression = (
  state: SelectStatementState,
  {
    includeSoftDeletePredicate = true,
  }: { includeSoftDeletePredicate?: boolean } = {},
): string => {
  const userExpression = renderUserWhereExpression(state.whereClauses);

  const shouldAddSoftDeletePredicate =
    includeSoftDeletePredicate &&
    !state.includeDeleted &&
    state.tableShape.hasDeletedAtColumn;

  if (!shouldAddSoftDeletePredicate) {
    return userExpression;
  }

  const softDeletePredicate = `${quoteColumn(state.alias, 'deletedAt')} IS NULL`;

  if (userExpression.length === 0) {
    return softDeletePredicate;
  }

  return `(${userExpression}) AND ${softDeletePredicate}`;
};

export const buildFromClause = (state: SelectStatementState): string =>
  `FROM ${escapeIdentifier(state.tableShape.schemaName)}.${escapeIdentifier(
    state.tableShape.tableName,
  )} AS ${escapeIdentifier(state.alias)}`;

const buildToManyDedupedJoinSource = ({
  tableExpression,
  foreignKeyColumnName,
  includeSoftDeleteFilter,
}: {
  tableExpression: string;
  foreignKeyColumnName: string;
  includeSoftDeleteFilter: boolean;
}): string => {
  const foreignKey = escapeIdentifier(foreignKeyColumnName);
  const whereClause = includeSoftDeleteFilter
    ? ` WHERE ${escapeIdentifier('deletedAt')} IS NULL`
    : '';

  return `(SELECT DISTINCT ON (${foreignKey}) * FROM ${tableExpression}${whereClause} ORDER BY ${foreignKey}, ${escapeIdentifier('id')})`;
};

export const buildJoinClause = (state: SelectStatementState): string =>
  state.joinClauses
    .map((joinClause) => {
      if (!isDefined(joinClause.condition)) {
        throw new TwentyOrmV2Exception(
          `Only to-one relations can be joined; "${joinClause.alias}" is to-many and must be loaded as a separate query`,
          TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
        );
      }

      const softDeletePredicateApplies =
        !state.includeDeleted && joinClause.targetTableShape.hasDeletedAtColumn;

      const isDedupedToManyJoin =
        joinClause.relationType === RelationType.ONE_TO_MANY &&
        isDefined(joinClause.toManyForeignKeyColumnName);

      const onConditions = [
        joinClause.condition,
        ...joinClause.additionalOnConditions,
      ];

      // A to-one join filters soft-deleted rows in its ON clause. The deduped
      // to-many join picks one representative row per parent, so its soft-delete
      // filter runs inside the derived table before that pick.
      if (softDeletePredicateApplies && !isDedupedToManyJoin) {
        onConditions.push(
          `${quoteColumn(joinClause.alias, 'deletedAt')} IS NULL`,
        );
      }

      const tableExpression = `${escapeIdentifier(
        joinClause.targetTableShape.schemaName,
      )}.${escapeIdentifier(joinClause.targetTableShape.tableName)}`;

      const joinSource = isDedupedToManyJoin
        ? buildToManyDedupedJoinSource({
            tableExpression,
            foreignKeyColumnName:
              joinClause.toManyForeignKeyColumnName as string,
            includeSoftDeleteFilter: softDeletePredicateApplies,
          })
        : tableExpression;

      return `LEFT JOIN ${joinSource} AS ${escapeIdentifier(
        joinClause.alias,
      )} ON ${onConditions
        .map((condition) => `(${condition})`)
        .join(' AND ')}`;
    })
    .join(' ');

export const buildGroupByClause = (state: SelectStatementState): string => {
  if (state.groupByExpressions.length === 0) {
    return '';
  }

  return `GROUP BY ${state.groupByExpressions.join(', ')}`;
};

export const buildOrderByClause = (state: SelectStatementState): string => {
  if (state.orderByClauses.length === 0) {
    return '';
  }

  return `ORDER BY ${state.orderByClauses
    .map(
      (orderByClause) =>
        `${orderByClause.expression} ${orderByClause.direction}${
          isDefined(orderByClause.nulls) ? ` ${orderByClause.nulls}` : ''
        }`,
    )
    .join(', ')}`;
};

// Inlining page size and offset would mint a new prepared statement shape per page, so
// they bind as parameters under reserved names the shared parsers cannot produce.
export const LIMIT_PARAMETER_NAME = 'ormV2Limit';
export const OFFSET_PARAMETER_NAME = 'ormV2Offset';

export const RESERVED_PARAMETER_NAMES: string[] = [
  LIMIT_PARAMETER_NAME,
  OFFSET_PARAMETER_NAME,
];

export const buildPaginationParameters = (
  state: SelectStatementState,
): Record<string, number> => ({
  ...(isDefined(state.limitValue)
    ? { [LIMIT_PARAMETER_NAME]: Number(state.limitValue) }
    : {}),
  ...(isDefined(state.offsetValue)
    ? { [OFFSET_PARAMETER_NAME]: Number(state.offsetValue) }
    : {}),
});

export const buildSelectStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

  return [
    `SELECT ${buildProjection(state).expressions.join(', ')}`,
    buildFromClause(state),
    buildJoinClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
    buildGroupByClause(state),
    buildOrderByClause(state),
    isDefined(state.limitValue) ? `LIMIT :${LIMIT_PARAMETER_NAME}` : '',
    isDefined(state.offsetValue) ? `OFFSET :${OFFSET_PARAMETER_NAME}` : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

export const buildCountStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

  return [
    'SELECT COUNT(1) AS "count"',
    buildFromClause(state),
    buildJoinClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

// Only the projected columns of the main alias become entity properties: anything else
// in the row, such as a relation order-by column, is raw join output.
export const mapRowToEntity = <T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  columnNameByResultAlias: Record<string, string>,
): T => {
  const entity: Record<string, unknown> = {};

  for (const [resultAlias, columnName] of Object.entries(
    columnNameByResultAlias,
  )) {
    if (resultAlias in row) {
      entity[columnName] = row[resultAlias];
    }
  }

  return entity as T;
};

export const buildColumnNameByResultAlias = (
  alias: string,
  mainAliasColumnNames: string[],
): Record<string, string> =>
  Object.fromEntries(
    mainAliasColumnNames.map((columnName) => [
      buildColumnResultAlias(alias, columnName),
      columnName,
    ]),
  );
