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
  parentAlias: string;
  relationFieldName: string;
  targetTableShape: WorkspaceTableShape;
  relationType: RelationType;
  joinType: 'INNER' | 'LEFT';
  // A joinAndSelect projects every column of the joined table and hydrates them
  // into the relation property of the parent entity.
  isSelected?: boolean;
  condition?: string;
  toManyForeignKeyColumnName?: string;
  toManyPlainCondition?: string;
  additionalOnConditions: string[];
};

// A single joined column projected through addSelect('<alias>.<column>').
export type ColumnSelection = {
  alias: string;
  columnName: string;
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
  columnSelections: ColumnSelection[];
  joinClauses: JoinClause[];
  whereClauses: WhereClause[];
  groupByExpressions: string[];
  orderByClauses: OrderByClause[];
  distinctOnExpressions: string[];
  includeDeleted: boolean;
  // A raw or aggregation read tolerates row multiplication, so it may render a
  // plain to-many join; an entity-hydrating read must stay one row per entity.
  allowPlainToManyJoins: boolean;
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

// TypeORM lets raw SQL fragments reference columns as <alias>.<column>; Postgres
// would fold those bare identifiers to lowercase and miss the quoted aliases, so
// they are quoted here against the aliases the statement knows about.
export const quoteQualifiedAliasReferences = (
  expression: string,
  aliases: string[],
): string =>
  aliases.reduce(
    (quotedExpression, alias) =>
      quotedExpression.replace(
        new RegExp(
          `(?<![\\w".:])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.(\\w+)`,
          'g',
        ),
        (_, columnName) => quoteColumn(alias, columnName),
      ),
    expression,
  );

export const collectStatementAliases = (
  state: SelectStatementState,
): string[] => [
  state.alias,
  ...state.joinClauses.map((joinClause) => joinClause.alias),
];

// The dotted property chain a joined alias hydrates into, e.g. a join of
// "company.owner" aliased "owner" under a join of "person.company" aliased
// "company" resolves to "company.owner".
const buildJoinPropertyPath = (
  state: SelectStatementState,
  joinAlias: string,
): string => {
  const propertySegments: string[] = [];
  let currentAlias = joinAlias;

  while (currentAlias !== state.alias) {
    const joinClause = state.joinClauses.find(
      (candidate) => candidate.alias === currentAlias,
    );

    if (!isDefined(joinClause)) {
      throw new TwentyOrmV2Exception(
        `Alias "${currentAlias}" does not belong to this statement`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    propertySegments.unshift(joinClause.relationFieldName);
    currentAlias = joinClause.parentAlias;
  }

  return propertySegments.join('.');
};

export type JoinedColumnProjection = {
  joinAlias: string;
  columnName: string;
  resultAlias: string;
  propertyPath: string;
};

export const collectJoinedColumnProjections = (
  state: SelectStatementState,
): JoinedColumnProjection[] => {
  const projections: JoinedColumnProjection[] = [];
  const seenResultAliases = new Set<string>();

  const addProjection = (joinAlias: string, columnName: string) => {
    const resultAlias = buildColumnResultAlias(joinAlias, columnName);

    if (seenResultAliases.has(resultAlias)) {
      return;
    }

    seenResultAliases.add(resultAlias);
    projections.push({
      joinAlias,
      columnName,
      resultAlias,
      propertyPath: buildJoinPropertyPath(state, joinAlias),
    });
  };

  for (const joinClause of state.joinClauses) {
    if (joinClause.isSelected !== true) {
      continue;
    }

    for (const columnName of joinClause.targetTableShape.columnNames) {
      addProjection(joinClause.alias, columnName);
    }
  }

  for (const columnSelection of state.columnSelections) {
    if (columnSelection.alias === state.alias) {
      continue;
    }

    addProjection(columnSelection.alias, columnSelection.columnName);
  }

  return projections;
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

  const projectedMainColumnNames = new Set(mainAliasColumnNames);

  for (const columnSelection of state.columnSelections) {
    if (
      columnSelection.alias !== state.alias ||
      projectedMainColumnNames.has(columnSelection.columnName)
    ) {
      continue;
    }

    projectedMainColumnNames.add(columnSelection.columnName);
    expressions.push(
      `${quoteColumn(state.alias, columnSelection.columnName)} AS ${escapeIdentifier(
        buildColumnResultAlias(state.alias, columnSelection.columnName),
      )}`,
    );
  }

  for (const joinedProjection of collectJoinedColumnProjections(state)) {
    expressions.push(
      `${quoteColumn(
        joinedProjection.joinAlias,
        joinedProjection.columnName,
      )} AS ${escapeIdentifier(joinedProjection.resultAlias)}`,
    );
  }

  const aliases = collectStatementAliases(state);

  for (const extraSelect of state.extraSelectClauses) {
    expressions.push(
      `${quoteQualifiedAliasReferences(
        extraSelect.expression,
        aliases,
      )} AS ${escapeIdentifier(extraSelect.alias)}`,
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
  const userExpression = quoteQualifiedAliasReferences(
    renderUserWhereExpression(state.whereClauses),
    collectStatementAliases(state),
  );

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
      const condition =
        joinClause.condition ??
        (state.allowPlainToManyJoins
          ? joinClause.toManyPlainCondition
          : undefined);

      if (!isDefined(condition)) {
        throw new TwentyOrmV2Exception(
          `Only to-one relations can be joined; "${joinClause.alias}" is to-many and must be loaded as a separate query`,
          TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
        );
      }

      const softDeletePredicateApplies =
        !state.includeDeleted && joinClause.targetTableShape.hasDeletedAtColumn;

      const toManyForeignKeyColumnName =
        joinClause.relationType === RelationType.ONE_TO_MANY
          ? joinClause.toManyForeignKeyColumnName
          : undefined;

      const onConditions = [condition, ...joinClause.additionalOnConditions];

      // A to-one join filters soft-deleted rows in its ON clause. The deduped
      // to-many join picks one representative row per parent, so its soft-delete
      // filter runs inside the derived table before that pick.
      if (
        softDeletePredicateApplies &&
        !isDefined(toManyForeignKeyColumnName)
      ) {
        onConditions.push(
          `${quoteColumn(joinClause.alias, 'deletedAt')} IS NULL`,
        );
      }

      const tableExpression = `${escapeIdentifier(
        joinClause.targetTableShape.schemaName,
      )}.${escapeIdentifier(joinClause.targetTableShape.tableName)}`;

      const joinSource = isDefined(toManyForeignKeyColumnName)
        ? buildToManyDedupedJoinSource({
            tableExpression,
            foreignKeyColumnName: toManyForeignKeyColumnName,
            includeSoftDeleteFilter: softDeletePredicateApplies,
          })
        : tableExpression;

      return `${joinClause.joinType} JOIN ${joinSource} AS ${escapeIdentifier(
        joinClause.alias,
      )} ON ${onConditions.map((condition) => `(${condition})`).join(' AND ')}`;
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

  const aliases = collectStatementAliases(state);

  return `ORDER BY ${state.orderByClauses
    .map(
      (orderByClause) =>
        `${quoteQualifiedAliasReferences(orderByClause.expression, aliases)} ${
          orderByClause.direction
        }${isDefined(orderByClause.nulls) ? ` ${orderByClause.nulls}` : ''}`,
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

const buildDistinctOnClause = (state: SelectStatementState): string => {
  if (state.distinctOnExpressions.length === 0) {
    return '';
  }

  const aliases = collectStatementAliases(state);

  return `DISTINCT ON (${state.distinctOnExpressions
    .map((expression) => quoteQualifiedAliasReferences(expression, aliases))
    .join(', ')}) `;
};

export const buildSelectStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

  return [
    `SELECT ${buildDistinctOnClause(state)}${buildProjection(state).expressions.join(', ')}`,
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

  // A join can multiply rows, so counting mirrors TypeORM's getCount and counts
  // distinct main-alias records instead of result rows.
  const countExpression =
    state.joinClauses.length > 0
      ? `COUNT(DISTINCT ${quoteColumn(state.alias, 'id')})`
      : 'COUNT(1)';

  return [
    `SELECT ${countExpression} AS "count"`,
    buildFromClause(state),
    buildJoinClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

type RelationColumnLeaf = {
  propertySegments: string[];
  value: unknown;
};

// A LEFT JOIN with no matching row projects only NULLs for the joined alias;
// TypeORM maps that relation to null rather than a shell object of nulls.
const buildRelationValue = (leaves: RelationColumnLeaf[]): unknown => {
  if (leaves.every((leaf) => leaf.value === null)) {
    return null;
  }

  const relationValue: Record<string, unknown> = {};
  const nestedLeavesByProperty = new Map<string, RelationColumnLeaf[]>();

  for (const leaf of leaves) {
    const [propertyName, ...remainingSegments] = leaf.propertySegments;

    if (remainingSegments.length === 0) {
      relationValue[propertyName] = leaf.value;
      continue;
    }

    const nestedLeaves = nestedLeavesByProperty.get(propertyName) ?? [];

    nestedLeaves.push({
      propertySegments: remainingSegments,
      value: leaf.value,
    });
    nestedLeavesByProperty.set(propertyName, nestedLeaves);
  }

  for (const [propertyName, nestedLeaves] of nestedLeavesByProperty) {
    relationValue[propertyName] = buildRelationValue(nestedLeaves);
  }

  return relationValue;
};

// Only projected columns become entity properties: a plain path maps onto the main
// entity, a dotted path nests under the relation property chain it was joined
// through, and anything else in the row is raw join output that gets dropped.
export const mapRowToEntity = <T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  columnNameByResultAlias: Record<string, string>,
): T => {
  const entity: Record<string, unknown> = {};
  const relationLeavesByProperty = new Map<string, RelationColumnLeaf[]>();

  for (const [resultAlias, propertyPath] of Object.entries(
    columnNameByResultAlias,
  )) {
    if (!(resultAlias in row)) {
      continue;
    }

    const propertySegments = propertyPath.split('.');

    if (propertySegments.length === 1) {
      entity[propertyPath] = row[resultAlias];
      continue;
    }

    const [relationProperty, ...remainingSegments] = propertySegments;
    const relationLeaves = relationLeavesByProperty.get(relationProperty) ?? [];

    relationLeaves.push({
      propertySegments: remainingSegments,
      value: row[resultAlias],
    });
    relationLeavesByProperty.set(relationProperty, relationLeaves);
  }

  for (const [relationProperty, relationLeaves] of relationLeavesByProperty) {
    entity[relationProperty] = buildRelationValue(relationLeaves);
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

// Maps every projected result alias of a select back to the property path it
// hydrates: a main column maps to its name, a joined column to the dotted
// relation chain it was joined through.
export const buildHydrationPathByResultAlias = (
  state: SelectStatementState,
): Record<string, string> => {
  const { mainAliasColumnNames } = buildProjection(state);

  const mainColumnNames = [
    ...mainAliasColumnNames,
    ...state.columnSelections
      .filter((columnSelection) => columnSelection.alias === state.alias)
      .map((columnSelection) => columnSelection.columnName),
  ];

  return {
    ...buildColumnNameByResultAlias(state.alias, mainColumnNames),
    ...Object.fromEntries(
      collectJoinedColumnProjections(state).map((joinedProjection) => [
        joinedProjection.resultAlias,
        `${joinedProjection.propertyPath}.${joinedProjection.columnName}`,
      ]),
    ),
  };
};
