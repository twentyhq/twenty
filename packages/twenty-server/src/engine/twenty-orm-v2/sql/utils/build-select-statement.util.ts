import { isDefined } from 'twenty-shared/utils';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
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
  condition: string;
  // Predicates that must not turn the LEFT JOIN into an inner join, so they are AND-ed
  // into ON rather than WHERE: row-level permissions and the joined soft-delete filter.
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

// Everything the SQL text is assembled from. The builder owns this state and mutates it;
// the functions here only read it, which keeps statement assembly separable from the
// TypeORM-shaped surface the callers use.
export type SelectStatementState = {
  alias: string;
  tableShape: WorkspaceTableShape;
  findOptions: FindOptionsLike;
  explicitSelection?: string[];
  extraSelectClauses: SelectClause[];
  joinClauses: JoinClause[];
  whereClauses: WhereClause[];
  orderByClauses: OrderByClause[];
  groupByExpressions: string[];
  includeDeleted: boolean;
  limitValue?: number;
  offsetValue?: number;
};

export const quoteColumn = (alias: string, columnName: string): string =>
  `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

// Accepts the forms the shared parsers emit: "alias.column", "column", and
// already-quoted `"alias"."column"`.
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
    .filter(([, isSelected]) => isSelected === true)
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
        `${state.alias}_${columnName}`,
      )}`,
  );

  for (const extraSelect of state.extraSelectClauses) {
    expressions.push(
      `${extraSelect.expression} AS ${escapeIdentifier(extraSelect.alias)}`,
    );
  }

  return { expressions, mainAliasColumnNames };
};

export const buildWhereExpression = (
  state: SelectStatementState,
  {
    includeSoftDeletePredicate = true,
  }: { includeSoftDeletePredicate?: boolean } = {},
): string => {
  const userExpression = state.whereClauses
    .map((clause, index) =>
      index === 0
        ? clause.sql
        : `${clause.operator.toUpperCase()} ${clause.sql}`,
    )
    .join(' ');

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

  // AND binds tighter than OR, so the accumulated clauses have to be wrapped as a whole:
  // without this, "A OR B AND deletedAt IS NULL" leaves rows matching A unfiltered.
  return `(${userExpression}) AND ${softDeletePredicate}`;
};

export const buildFromClause = (state: SelectStatementState): string =>
  `FROM ${escapeIdentifier(state.tableShape.schemaName)}.${escapeIdentifier(
    state.tableShape.tableName,
  )} AS ${escapeIdentifier(state.alias)}`;

export const buildJoinClause = (state: SelectStatementState): string =>
  state.joinClauses
    .map((joinClause) => {
      const onConditions = [
        joinClause.condition,
        ...joinClause.additionalOnConditions,
      ];

      if (
        !state.includeDeleted &&
        joinClause.targetTableShape.hasDeletedAtColumn
      ) {
        onConditions.push(
          `${quoteColumn(joinClause.alias, 'deletedAt')} IS NULL`,
        );
      }

      return `LEFT JOIN ${escapeIdentifier(
        joinClause.targetTableShape.schemaName,
      )}.${escapeIdentifier(
        joinClause.targetTableShape.tableName,
      )} AS ${escapeIdentifier(joinClause.alias)} ON ${onConditions
        .map((condition) => `(${condition})`)
        .join(' AND ')}`;
    })
    .join(' ');

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

export const buildSelectStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

  return [
    `SELECT ${buildProjection(state).expressions.join(', ')}`,
    buildFromClause(state),
    buildJoinClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
    state.groupByExpressions.length > 0
      ? `GROUP BY ${state.groupByExpressions.join(', ')}`
      : '',
    buildOrderByClause(state),
    isDefined(state.limitValue) ? `LIMIT ${Number(state.limitValue)}` : '',
    isDefined(state.offsetValue) ? `OFFSET ${Number(state.offsetValue)}` : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

export const buildCountStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

  return [
    `SELECT COUNT(DISTINCT ${quoteColumn(state.alias, 'id')}) AS "count"`,
    buildFromClause(state),
    buildJoinClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

// Rows come back with alias-prefixed column names so joined aliases cannot collide with
// the main one; this strips the prefix back off.
export const mapRowToEntity = <T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  alias: string,
): T => {
  const entity: Record<string, unknown> = {};
  const mainAliasPrefix = `${alias}_`;

  for (const [columnAlias, value] of Object.entries(row)) {
    if (columnAlias.startsWith(mainAliasPrefix)) {
      entity[columnAlias.slice(mainAliasPrefix.length)] = value;
      continue;
    }

    entity[columnAlias] = value;
  }

  return entity as T;
};
