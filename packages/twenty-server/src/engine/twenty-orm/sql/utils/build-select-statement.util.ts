import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';
import {
  buildUnreadableColumnReplacements,
  type UnreadableColumnReplacements,
} from 'src/engine/twenty-orm/sql/utils/build-unreadable-column-replacements.util';
import { findUnreadableColumnConditions } from 'src/engine/twenty-orm/sql/utils/find-unreadable-column-conditions.util';
import { renderReadableCondition } from 'src/engine/twenty-orm/sql/utils/render-readable-condition.util';
import { renderUnreadableAwareCondition } from 'src/engine/twenty-orm/sql/utils/render-unreadable-aware-condition.util';
import { escapeRegularExpression } from 'src/engine/twenty-orm/sql/utils/escape-regular-expression.util';
import { replaceUnreadableColumnReferences } from 'src/engine/twenty-orm/sql/utils/replace-unreadable-column-references.util';
import { renderUnreadableColumn } from 'src/engine/twenty-orm/sql/utils/render-unreadable-column.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type FindOptionsLike } from 'src/engine/twenty-orm/query-builder/types/query-builder.type';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type WhereConditionClause = {
  operator: 'and' | 'or';
  sql: string;
  shouldReadUnreadableColumnsAsNull?: boolean;
};

export type WhereGroupClause = {
  operator: 'and' | 'or';
  isNegated: boolean;
  clauses: WhereClause[];
  shouldReadUnreadableColumnsAsNull?: boolean;
};

type RenderWhereCondition = (args: {
  condition: string;
  shouldReadUnreadableColumnsAsNull: boolean;
}) => string;

export type WhereClause = WhereConditionClause | WhereGroupClause;

export type JoinClause = {
  alias: string;
  parentAlias: string;
  relationFieldName: string;
  targetTableShape: WorkspaceTableShape;
  relationType: RelationType;
  joinType: 'INNER' | 'LEFT';
  isSelected?: boolean;
  condition?: string;
  toManyForeignKeyColumnName?: string;
  toManyPlainCondition?: string;
  toManyDedupOrder?: ToManyDedupOrder[];
  additionalOnConditions: string[];
};

export type ToManyDedupOrder = {
  columnName: string;
  direction: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export type ExistsFilterClause = {
  token: string;
  alias: string;
  parentAlias: string;
  relationFieldName: string;
  targetTableShape: WorkspaceTableShape;
  correlationCondition: string;
  conditionClauses: WhereClause[];
  additionalOnConditions: string[];
};

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

type SQLConditionsByAliasAndName = Record<string, Record<string, string[]>>;

export type UnreadableColumnConditions = SQLConditionsByAliasAndName;

export type UnreadableRelationConditions = SQLConditionsByAliasAndName;

export type SelectStatementState = {
  alias: string;
  tableShape: WorkspaceTableShape;
  findOptions: FindOptionsLike;
  explicitSelection?: string[];
  extraSelectClauses: SelectClause[];
  columnSelections: ColumnSelection[];
  unreadableColumnConditions: UnreadableColumnConditions;
  unreadableRelationConditions: UnreadableRelationConditions;
  joinClauses: JoinClause[];
  whereClauses: WhereClause[];
  rowAccessConditions: string[];
  existsFilterClauses: ExistsFilterClause[];
  groupByExpressions: string[];
  orderByClauses: OrderByClause[];
  distinctOnExpressions: string[];
  includeDeleted: boolean;
  allowPlainToManyJoins: boolean;
  limitValue?: number;
  offsetValue?: number;
  isLockedForUpdate?: boolean;
};

export const quoteColumn = (alias: string, columnName: string): string =>
  `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

const PLAIN_COLUMN_EXPRESSION = /^"?(\w+)"?\."?(\w+)"?$/;

const renderProjectedColumn = ({
  state,
  alias,
  columnName,
}: {
  state: Pick<
    SelectStatementState,
    'unreadableColumnConditions' | 'groupByExpressions'
  >;
  alias: string;
  columnName: string;
}): string => {
  const quotedColumn = quoteColumn(alias, columnName);
  const unreadableConditions =
    state.unreadableColumnConditions[alias]?.[columnName];

  if (!isDefined(unreadableConditions)) {
    return quotedColumn;
  }

  if (state.groupByExpressions.length > 0) {
    return `(${renderUnreadableColumn({ quotedColumn, unreadableConditions })})`;
  }

  return renderUnreadableColumn({ quotedColumn, unreadableConditions });
};

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

const SQL_TEXT_SEGMENTS = /('(?:[^']|'')*'|"[^"]*")/;

const quoteQualifiedAliasReferencesInSegment = (
  segment: string,
  aliases: string[],
): string =>
  aliases.reduce(
    (quotedSegment, alias) =>
      quotedSegment.replace(
        new RegExp(
          `(?<![\\w".:])${escapeRegularExpression(alias)}\\.(\\w+)`,
          'g',
        ),
        (_, columnName) => quoteColumn(alias, columnName),
      ),
    segment,
  );

export const quoteQualifiedAliasReferences = (
  expression: string,
  aliases: string[],
): string =>
  expression
    .split(SQL_TEXT_SEGMENTS)
    .map((segment, segmentIndex) =>
      segmentIndex % 2 === 1
        ? segment
        : quoteQualifiedAliasReferencesInSegment(segment, aliases),
    )
    .join('');

const replaceUnreadableColumnsInExpression = ({
  expression,
  aliases,
  unreadableColumnReplacements,
}: {
  expression: string;
  aliases: string[];
  unreadableColumnReplacements: UnreadableColumnReplacements | undefined;
}): string =>
  replaceUnreadableColumnReferences({
    expression: quoteQualifiedAliasReferences(expression, aliases),
    unreadableColumnReplacements,
  });

export const collectStatementAliases = (
  state: SelectStatementState,
): string[] => [
  state.alias,
  ...state.joinClauses.map((joinClause) => joinClause.alias),
];

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
      throw new TwentyOrmException(
        `Alias "${currentAlias}" does not belong to this statement`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
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
      throw new TwentyOrmException(
        `Column "${columnName}" does not exist on "${state.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
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
      `${renderProjectedColumn({ state, alias: state.alias, columnName })} AS ${escapeIdentifier(
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
      `${renderProjectedColumn({
        state,
        alias: state.alias,
        columnName: columnSelection.columnName,
      })} AS ${escapeIdentifier(
        buildColumnResultAlias(state.alias, columnSelection.columnName),
      )}`,
    );
  }

  for (const joinedProjection of collectJoinedColumnProjections(state)) {
    expressions.push(
      `${renderProjectedColumn({
        state,
        alias: joinedProjection.joinAlias,
        columnName: joinedProjection.columnName,
      })} AS ${escapeIdentifier(joinedProjection.resultAlias)}`,
    );
  }

  const aliases = collectStatementAliases(state);
  const unreadableColumnReplacements = buildUnreadableColumnReplacements(
    state.unreadableColumnConditions,
  );

  for (const extraSelect of state.extraSelectClauses) {
    const plainColumn = extraSelect.expression.match(PLAIN_COLUMN_EXPRESSION);
    const expression = isDefined(plainColumn)
      ? renderProjectedColumn({
          state,
          alias: plainColumn[1],
          columnName: plainColumn[2],
        })
      : replaceUnreadableColumnsInExpression({
          expression: extraSelect.expression,
          aliases,
          unreadableColumnReplacements,
        });

    expressions.push(`${expression} AS ${escapeIdentifier(extraSelect.alias)}`);
  }

  return { expressions, mainAliasColumnNames };
};

const renderWhereClause = ({
  whereClause,
  renderCondition,
  shouldReadUnreadableColumnsAsNull,
}: {
  whereClause: WhereClause;
  renderCondition: RenderWhereCondition;
  shouldReadUnreadableColumnsAsNull: boolean;
}): string => {
  const shouldReadClauseUnreadableColumnsAsNull =
    shouldReadUnreadableColumnsAsNull ||
    (whereClause.shouldReadUnreadableColumnsAsNull ?? false);

  if ('sql' in whereClause) {
    return renderCondition({
      condition: whereClause.sql,
      shouldReadUnreadableColumnsAsNull:
        shouldReadClauseUnreadableColumnsAsNull,
    });
  }

  const groupExpression = renderUserWhereExpression({
    whereClauses: whereClause.clauses,
    renderCondition,
    shouldReadUnreadableColumnsAsNull: shouldReadClauseUnreadableColumnsAsNull,
  });

  return whereClause.isNegated
    ? `NOT (${groupExpression})`
    : `(${groupExpression})`;
};

const renderUserWhereExpression = ({
  whereClauses,
  renderCondition = ({ condition }) => condition,
  shouldReadUnreadableColumnsAsNull = false,
}: {
  whereClauses: WhereClause[];
  renderCondition?: RenderWhereCondition;
  shouldReadUnreadableColumnsAsNull?: boolean;
}): string =>
  whereClauses
    .filter(
      (whereClause) => 'sql' in whereClause || whereClause.clauses.length > 0,
    )
    .map((whereClause, index) => {
      const renderedClause = renderWhereClause({
        whereClause,
        renderCondition,
        shouldReadUnreadableColumnsAsNull,
      });

      return index === 0
        ? renderedClause
        : `${whereClause.operator.toUpperCase()} ${renderedClause}`;
    })
    .join(' ');

const findUnreadableRelationConditions = ({
  unreadableRelationConditions,
  parentAlias,
  relationFieldName,
}: {
  unreadableRelationConditions: UnreadableRelationConditions;
  parentAlias: string;
  relationFieldName: string;
}): string[] =>
  unreadableRelationConditions[parentAlias]?.[relationFieldName] ?? [];

const findUnreadableRelationFilterConditions = ({
  condition,
  aliases,
  existsFilterClauses,
  unreadableRelationConditions,
}: {
  condition: string;
  aliases: string[];
  existsFilterClauses: ExistsFilterClause[];
  unreadableRelationConditions: UnreadableRelationConditions;
}): string[] =>
  existsFilterClauses
    .filter(
      ({ token, parentAlias }) =>
        aliases.includes(parentAlias) && condition.includes(token),
    )
    .flatMap(({ parentAlias, relationFieldName }) =>
      findUnreadableRelationConditions({
        unreadableRelationConditions,
        parentAlias,
        relationFieldName,
      }),
    );

const renderReadableWhereCondition = ({
  condition,
  shouldReadUnreadableColumnsAsNull,
  aliases,
  unreadableColumnReplacements,
  unreadableColumnConditions,
  existsFilterClauses,
  unreadableRelationConditions,
}: {
  condition: string;
  shouldReadUnreadableColumnsAsNull: boolean;
  aliases: string[];
  unreadableColumnReplacements: UnreadableColumnReplacements | undefined;
  unreadableColumnConditions: UnreadableColumnConditions;
  existsFilterClauses: ExistsFilterClause[];
  unreadableRelationConditions: UnreadableRelationConditions;
}): string => {
  const quotedCondition = quoteQualifiedAliasReferences(condition, aliases);
  const conditionWithReplacements = replaceUnreadableColumnReferences({
    expression: quotedCondition,
    unreadableColumnReplacements,
  });

  if (shouldReadUnreadableColumnsAsNull) {
    return conditionWithReplacements;
  }

  return renderUnreadableAwareCondition({
    condition: conditionWithReplacements,
    unreadableConditions: [
      ...findUnreadableColumnConditions({
        expressions: [quotedCondition],
        unreadableColumnConditions,
        aliases,
      }),
      ...findUnreadableRelationFilterConditions({
        condition,
        aliases,
        existsFilterClauses,
        unreadableRelationConditions,
      }),
    ],
  });
};

// Row access conditions stay outside the user expression so an OR in it can
// never bypass them
export const renderWhereExpressionWithRowAccess = ({
  whereClauses,
  rowAccessConditions,
  renderCondition,
}: {
  whereClauses: WhereClause[];
  rowAccessConditions: string[];
  renderCondition?: RenderWhereCondition;
}): string => {
  const userExpression = renderUserWhereExpression({
    whereClauses,
    renderCondition,
  });

  if (rowAccessConditions.length === 0) {
    return userExpression;
  }

  const rowAccessExpression = rowAccessConditions
    .map((rowAccessCondition) => `(${rowAccessCondition})`)
    .join(' AND ');

  return userExpression.length > 0
    ? `(${userExpression}) AND ${rowAccessExpression}`
    : rowAccessExpression;
};

const renderExistsFilter = ({
  existsFilterClause,
  existsFilterClauses,
  includeDeleted,
  unreadableColumnConditions,
  unreadableColumnReplacements,
  unreadableRelationConditions,
}: {
  existsFilterClause: Pick<
    ExistsFilterClause,
    | 'alias'
    | 'parentAlias'
    | 'relationFieldName'
    | 'targetTableShape'
    | 'correlationCondition'
    | 'additionalOnConditions'
    | 'conditionClauses'
  >;
  existsFilterClauses: ExistsFilterClause[];
  includeDeleted: boolean;
  unreadableColumnConditions: UnreadableColumnConditions;
  unreadableColumnReplacements: UnreadableColumnReplacements | undefined;
  unreadableRelationConditions: UnreadableRelationConditions;
}): string => {
  const conditions = [
    existsFilterClause.correlationCondition,
    ...existsFilterClause.additionalOnConditions,
    renderReadableCondition(
      findUnreadableRelationConditions({
        unreadableRelationConditions,
        parentAlias: existsFilterClause.parentAlias,
        relationFieldName: existsFilterClause.relationFieldName,
      }),
    ),
  ].filter(isDefined);

  const conditionExpression = renderUserWhereExpression({
    whereClauses: existsFilterClause.conditionClauses,
    renderCondition: ({ condition, shouldReadUnreadableColumnsAsNull }) =>
      renderReadableWhereCondition({
        condition,
        shouldReadUnreadableColumnsAsNull,
        aliases: [existsFilterClause.alias],
        unreadableColumnReplacements,
        unreadableColumnConditions,
        existsFilterClauses,
        unreadableRelationConditions,
      }),
  });

  if (conditionExpression.length > 0) {
    conditions.push(
      existsFilterClause.conditionClauses.length > 1
        ? `(${conditionExpression})`
        : conditionExpression,
    );
  }

  if (
    !includeDeleted &&
    existsFilterClause.targetTableShape.hasDeletedAtColumn
  ) {
    conditions.push(
      `${quoteColumn(existsFilterClause.alias, 'deletedAt')} IS NULL`,
    );
  }

  const tableExpression = `${escapeIdentifier(
    existsFilterClause.targetTableShape.schemaName,
  )}.${escapeIdentifier(existsFilterClause.targetTableShape.tableName)}`;

  return `EXISTS (SELECT 1 FROM ${tableExpression} AS ${escapeIdentifier(
    existsFilterClause.alias,
  )} WHERE ${conditions.join(' AND ')})`;
};

export const substituteExistsFilterTokens = ({
  expression,
  existsFilterClauses,
  includeDeleted,
  unreadableColumnConditions = {},
  unreadableRelationConditions = {},
}: {
  expression: string;
  existsFilterClauses: ExistsFilterClause[];
  includeDeleted: boolean;
  unreadableColumnConditions?: UnreadableColumnConditions;
  unreadableRelationConditions?: UnreadableRelationConditions;
}): string => {
  const unreadableColumnReplacements = buildUnreadableColumnReplacements(
    unreadableColumnConditions,
  );

  return existsFilterClauses.reduce(
    (substituted, existsFilterClause) =>
      substituted.split(existsFilterClause.token).join(
        renderExistsFilter({
          existsFilterClause,
          existsFilterClauses,
          includeDeleted,
          unreadableColumnConditions,
          unreadableColumnReplacements,
          unreadableRelationConditions,
        }),
      ),
    expression,
  );
};

export const buildWhereExpression = (
  state: SelectStatementState,
  {
    includeSoftDeletePredicate = true,
    substituteExistsFilters = true,
  }: {
    includeSoftDeletePredicate?: boolean;
    substituteExistsFilters?: boolean;
  } = {},
): string => {
  const aliases = collectStatementAliases(state);
  const unreadableColumnReplacements = buildUnreadableColumnReplacements(
    state.unreadableColumnConditions,
  );
  const renderedWhereExpression = quoteQualifiedAliasReferences(
    renderWhereExpressionWithRowAccess({
      whereClauses: state.whereClauses,
      renderCondition: ({ condition, shouldReadUnreadableColumnsAsNull }) =>
        renderReadableWhereCondition({
          condition,
          shouldReadUnreadableColumnsAsNull,
          aliases,
          unreadableColumnReplacements,
          unreadableColumnConditions: state.unreadableColumnConditions,
          existsFilterClauses: state.existsFilterClauses,
          unreadableRelationConditions: state.unreadableRelationConditions,
        }),
      rowAccessConditions: [
        ...state.rowAccessConditions,
        renderReadableCondition(
          findUnreadableColumnConditions({
            expressions: state.groupByExpressions.map((expression) =>
              quoteQualifiedAliasReferences(expression, aliases),
            ),
            unreadableColumnConditions: state.unreadableColumnConditions,
            aliases,
          }),
        ),
      ].filter(isDefined),
    }),
    aliases,
  );

  const filterExpression = substituteExistsFilters
    ? substituteExistsFilterTokens({
        expression: renderedWhereExpression,
        existsFilterClauses: state.existsFilterClauses,
        includeDeleted: state.includeDeleted,
        unreadableColumnConditions: state.unreadableColumnConditions,
        unreadableRelationConditions: state.unreadableRelationConditions,
      })
    : renderedWhereExpression;

  const shouldAddSoftDeletePredicate =
    includeSoftDeletePredicate &&
    !state.includeDeleted &&
    state.tableShape.hasDeletedAtColumn;

  if (!shouldAddSoftDeletePredicate) {
    return filterExpression;
  }

  const softDeletePredicate = `${quoteColumn(state.alias, 'deletedAt')} IS NULL`;

  if (filterExpression.length === 0) {
    return softDeletePredicate;
  }

  return `(${filterExpression}) AND ${softDeletePredicate}`;
};

export const buildFromClause = (state: SelectStatementState): string =>
  `FROM ${escapeIdentifier(state.tableShape.schemaName)}.${escapeIdentifier(
    state.tableShape.tableName,
  )} AS ${escapeIdentifier(state.alias)}`;

const buildToManyDedupedJoinSource = ({
  tableExpression,
  foreignKeyColumnName,
  includeSoftDeleteFilter,
  dedupOrder = [],
}: {
  tableExpression: string;
  foreignKeyColumnName: string;
  includeSoftDeleteFilter: boolean;
  dedupOrder?: ToManyDedupOrder[];
}): string => {
  const foreignKey = escapeIdentifier(foreignKeyColumnName);
  const whereClause = includeSoftDeleteFilter
    ? ` WHERE ${escapeIdentifier('deletedAt')} IS NULL`
    : '';

  const orderExpressions = [
    foreignKey,
    ...dedupOrder.map(
      (order) =>
        `${escapeIdentifier(order.columnName)} ${order.direction}${
          isDefined(order.nulls) ? ` ${order.nulls}` : ''
        }`,
    ),
    escapeIdentifier('id'),
  ];

  return `(SELECT DISTINCT ON (${foreignKey}) * FROM ${tableExpression}${whereClause} ORDER BY ${orderExpressions.join(', ')})`;
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
        throw new TwentyOrmException(
          `Only to-one relations can be joined; "${joinClause.alias}" is to-many and must be loaded as a separate query`,
          TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
        );
      }

      const softDeletePredicateApplies =
        !state.includeDeleted && joinClause.targetTableShape.hasDeletedAtColumn;

      const toManyForeignKeyColumnName =
        joinClause.relationType === RelationType.ONE_TO_MANY
          ? joinClause.toManyForeignKeyColumnName
          : undefined;

      const onConditions = [
        condition,
        ...joinClause.additionalOnConditions,
        renderReadableCondition(
          findUnreadableRelationConditions({
            unreadableRelationConditions: state.unreadableRelationConditions,
            parentAlias: joinClause.parentAlias,
            relationFieldName: joinClause.relationFieldName,
          }),
        ),
      ].filter(isDefined);

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
            dedupOrder: joinClause.toManyDedupOrder,
          })
        : tableExpression;

      return `${joinClause.joinType} JOIN ${joinSource} AS ${escapeIdentifier(
        joinClause.alias,
      )} ON ${onConditions.map((condition) => `(${condition})`).join(' AND ')}`;
    })
    .join(' ');

const replaceUnreadableColumnsInStatementExpressions = ({
  state,
  expressions,
}: {
  state: SelectStatementState;
  expressions: string[];
}): string[] => {
  const aliases = collectStatementAliases(state);
  const unreadableColumnReplacements = buildUnreadableColumnReplacements(
    state.unreadableColumnConditions,
  );

  return expressions.map((expression) =>
    replaceUnreadableColumnsInExpression({
      expression,
      aliases,
      unreadableColumnReplacements,
    }),
  );
};

export const buildGroupByClause = (state: SelectStatementState): string => {
  if (state.groupByExpressions.length === 0) {
    return '';
  }

  return `GROUP BY ${replaceUnreadableColumnsInStatementExpressions({
    state,
    expressions: state.groupByExpressions,
  }).join(', ')}`;
};

export const buildOrderByClause = (state: SelectStatementState): string => {
  if (state.orderByClauses.length === 0) {
    return '';
  }

  const expressionsWithReplacements =
    replaceUnreadableColumnsInStatementExpressions({
      state,
      expressions: state.orderByClauses.map(({ expression }) => expression),
    });

  return `ORDER BY ${state.orderByClauses
    .map(
      (orderByClause, index) =>
        `${expressionsWithReplacements[index]} ${orderByClause.direction}${isDefined(orderByClause.nulls) ? ` ${orderByClause.nulls}` : ''}`,
    )
    .join(', ')}`;
};

export const LIMIT_PARAMETER_NAME = 'ormLimit';
export const OFFSET_PARAMETER_NAME = 'ormOffset';

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

  return `DISTINCT ON (${replaceUnreadableColumnsInStatementExpressions({
    state,
    expressions: state.distinctOnExpressions,
  }).join(', ')}) `;
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
    state.isLockedForUpdate
      ? `FOR UPDATE OF ${escapeIdentifier(state.alias)}`
      : '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};

export const buildCountStatement = (state: SelectStatementState): string => {
  const whereExpression = buildWhereExpression(state);

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

const buildRelationValue = (leaves: RelationColumnLeaf[]): unknown => {
  const idLeaf = leaves.find(
    (leaf) =>
      leaf.propertySegments.length === 1 && leaf.propertySegments[0] === 'id',
  );

  if (isDefined(idLeaf) && idLeaf.value === null) {
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

export const createRowToEntityMapper = <TRecord extends ObjectLiteral>(
  columnNameByResultAlias: Record<string, string>,
): ((row: Record<string, unknown>) => TRecord) => {
  const columns = Object.entries(columnNameByResultAlias).map(
    ([resultAlias, propertyPath]) => {
      const [propertyName, ...remainingSegments] = propertyPath.split('.');

      return { resultAlias, propertyName, remainingSegments };
    },
  );

  return (row) => {
    const entity: Record<string, unknown> = {};
    const relationLeavesByProperty = new Map<string, RelationColumnLeaf[]>();

    for (const { resultAlias, propertyName, remainingSegments } of columns) {
      if (!(resultAlias in row)) {
        continue;
      }

      if (remainingSegments.length === 0) {
        entity[propertyName] = row[resultAlias];
        continue;
      }

      const relationLeaves = relationLeavesByProperty.get(propertyName) ?? [];

      relationLeaves.push({
        propertySegments: remainingSegments,
        value: row[resultAlias],
      });
      relationLeavesByProperty.set(propertyName, relationLeaves);
    }

    for (const [relationProperty, relationLeaves] of relationLeavesByProperty) {
      entity[relationProperty] = buildRelationValue(relationLeaves);
    }

    return entity as TRecord;
  };
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
