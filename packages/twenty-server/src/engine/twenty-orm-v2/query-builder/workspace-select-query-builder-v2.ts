import { isDefined } from 'twenty-shared/utils';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  type ExpressionMapLike,
  type FindOptionsLike,
  type OrderByConditionLike,
  type WhereExpressionLike,
  type WhereFactoryLike,
  isNegatedWhereFactoryLike,
  isWhereFactoryLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const QUALIFIED_COLUMN_REFERENCE = /"(\w+)"\."(\w+)"/g;

// Aggregate expressions are SQL text, so the columns they read have to be recovered from
// it for the permission check. CONCAT-style expressions name columns without an alias,
// which is what ProcessAggregateHelper already knows how to unpack.
const extractColumnNamesFromExpression = (expression: string): string[] => {
  const qualifiedColumnNames = [
    ...expression.matchAll(QUALIFIED_COLUMN_REFERENCE),
  ].map(([, , columnName]) => columnName);

  if (qualifiedColumnNames.length > 0) {
    return qualifiedColumnNames;
  }

  return (
    ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
      expression,
    ) ?? []
  );
};

type WhereClause = {
  operator: 'and' | 'or';
  sql: string;
};

type JoinClause = {
  alias: string;
  targetTableShape: WorkspaceTableShape;
  condition: string;
  // Predicates that must not turn the LEFT JOIN into an inner join, so they are AND-ed
  // into ON rather than WHERE: row-level permissions and the joined soft-delete filter.
  additionalOnConditions: string[];
};

type SelectClause = {
  expression: string;
  alias: string;
};

type OrderByClause = {
  expression: string;
  direction: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export type QueryBuilderV2Context = {
  tableShape: WorkspaceTableShape;
  executor: QueryExecutorV2;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  onBeforeExecute: (queryBuilder: WorkspaceSelectQueryBuilderV2) => void;
  // Composite fields are reassembled from flat metadata, exactly as ORM v1 does after
  // TypeORM hydration, so getMany() returns the same shape to callers.
  formatResult: <T>(records: unknown) => T;
};

// Mirrors the slice of TypeORM's SelectQueryBuilder that the common query runners and the
// shared GraphQL parsers use, so call sites do not change. Underneath it composes SQL text
// with named parameters and hands pg a parameterised statement.
export class WorkspaceSelectQueryBuilderV2 implements WhereExpressionLike {
  readonly alias: string;
  readonly tableShape: WorkspaceTableShape;

  private readonly context: QueryBuilderV2Context;
  private readonly whereClauses: WhereClause[] = [];
  private readonly joinClauses: JoinClause[] = [];
  private readonly extraSelectClauses: SelectClause[] = [];
  private orderByClauses: OrderByClause[] = [];
  private parameters: Record<string, unknown> = {};
  private findOptions: FindOptionsLike = {};
  private limitValue?: number;
  private offsetValue?: number;
  private includeDeleted = false;
  private groupByExpressions: string[] = [];
  // Set by select(): an explicit list replaces the findOptions selection entirely, and an
  // empty list means "no main-alias columns", which is how the aggregate builder is set up.
  private explicitSelection?: string[];
  private readonly aliasesWithRowLevelPermissionApplied = new Set<string>();

  constructor(alias: string, context: QueryBuilderV2Context) {
    this.alias = alias;
    this.tableShape = context.tableShape;
    this.context = context;
  }

  get expressionMap(): ExpressionMapLike {
    return {
      queryType: 'select',
      joinAttributes: this.joinClauses.map((joinClause) => ({
        alias: { name: joinClause.alias },
      })),
      wheres: this.whereClauses,
    };
  }

  clone(): WorkspaceSelectQueryBuilderV2 {
    const cloned = new WorkspaceSelectQueryBuilderV2(this.alias, this.context);

    cloned.whereClauses.push(...this.whereClauses);
    cloned.joinClauses.push(
      ...this.joinClauses.map((joinClause) => ({
        ...joinClause,
        additionalOnConditions: [...joinClause.additionalOnConditions],
      })),
    );
    cloned.extraSelectClauses.push(...this.extraSelectClauses);
    cloned.orderByClauses = [...this.orderByClauses];
    cloned.parameters = { ...this.parameters };
    cloned.findOptions = { ...this.findOptions };
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.includeDeleted = this.includeDeleted;
    cloned.groupByExpressions = [...this.groupByExpressions];
    cloned.explicitSelection =
      this.explicitSelection === undefined
        ? undefined
        : [...this.explicitSelection];

    for (const alias of this.aliasesWithRowLevelPermissionApplied) {
      cloned.aliasesWithRowLevelPermissionApplied.add(alias);
    }

    return cloned;
  }

  where(
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ): this {
    // where() discards the accumulated WHERE, including any row-level predicate already
    // rendered into it, so the markers have to be cleared or the next execution would
    // silently run without them.
    this.whereClauses.length = 0;
    this.aliasesWithRowLevelPermissionApplied.clear();

    return this.appendWhere('and', condition, parameters);
  }

  andWhere(
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ): this {
    return this.appendWhere('and', condition, parameters);
  }

  orWhere(
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ): this {
    return this.appendWhere('or', condition, parameters);
  }

  setParameters(parameters: Record<string, unknown>): this {
    this.parameters = { ...this.parameters, ...parameters };

    return this;
  }

  getParameters(): Record<string, unknown> {
    return { ...this.parameters };
  }

  setFindOptions(findOptions: FindOptionsLike): this {
    this.findOptions = findOptions;

    return this;
  }

  getFindOptions(): FindOptionsLike {
    return this.findOptions;
  }

  select(selection?: string | string[], alias?: string): this {
    this.extraSelectClauses.length = 0;

    if (selection === undefined) {
      this.explicitSelection = undefined;

      return this;
    }

    if (Array.isArray(selection)) {
      this.explicitSelection = selection;

      return this;
    }

    this.explicitSelection = [];
    this.extraSelectClauses.push({
      expression: this.normaliseColumnExpression(selection),
      alias: alias ?? selection,
    });

    return this;
  }

  addSelect(expression: string, alias: string): this {
    this.extraSelectClauses.push({ expression, alias });

    return this;
  }

  orderBy(
    orderByOrExpression: OrderByConditionLike | string,
    direction: 'ASC' | 'DESC' = 'ASC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): this {
    this.orderByClauses = [];

    return this.appendOrderBy(orderByOrExpression, direction, nulls);
  }

  addOrderBy(
    orderByOrExpression: OrderByConditionLike | string,
    direction: 'ASC' | 'DESC' = 'ASC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): this {
    return this.appendOrderBy(orderByOrExpression, direction, nulls);
  }

  groupBy(expression: string): this {
    this.groupByExpressions = [this.normaliseColumnExpression(expression)];

    return this;
  }

  addGroupBy(expression: string): this {
    this.groupByExpressions.push(this.normaliseColumnExpression(expression));

    return this;
  }

  leftJoin(relationPath: string, alias: string, condition?: string): this {
    const [parentAlias, relationFieldName] = relationPath.split('.');

    if (!isDefined(relationFieldName)) {
      throw new TwentyOrmV2Exception(
        `Join path "${relationPath}" must be of the form "<alias>.<relationField>"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    if (this.joinClauses.some((joinClause) => joinClause.alias === alias)) {
      return this;
    }

    const relationShape =
      this.tableShape.relationShapeByFieldName[relationFieldName];

    if (!isDefined(relationShape)) {
      throw new TwentyOrmV2Exception(
        `Relation "${relationFieldName}" does not exist on "${this.tableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    if (!isDefined(relationShape.joinColumnName)) {
      throw new TwentyOrmV2Exception(
        `Only to-one relations can be joined; "${relationFieldName}" is to-many and must be loaded as a separate query`,
        TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    const targetTableShape = this.context.tableShapeByObjectMetadataId(
      relationShape.targetObjectMetadataId,
    );

    this.joinClauses.push({
      alias,
      targetTableShape,
      condition:
        condition ??
        `${this.quoteColumn(parentAlias, relationShape.joinColumnName)} = ${this.quoteColumn(alias, 'id')}`,
      additionalOnConditions: [],
    });

    return this;
  }

  withDeleted(): this {
    this.includeDeleted = true;

    return this;
  }

  take(count: number): this {
    return this.limit(count);
  }

  skip(count: number): this {
    return this.offset(count);
  }

  limit(count: number): this {
    this.limitValue = count;

    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;

    return this;
  }

  getQuery(): string {
    return this.buildSelectStatement().sql;
  }

  getQueryAndParameters(): [string, unknown[]] {
    const { sql, parameters } = this.buildSelectStatement();
    const compiled = compileNamedParameters(sql, parameters);

    return [compiled.text, compiled.values];
  }

  async getMany<T extends Record<string, unknown>>(options?: {
    noFormatting?: boolean;
  }): Promise<T[]> {
    const rows = await this.executeSelect();
    const entities = rows.map((row) => this.mapRowToEntity<T>(row));

    if (options?.noFormatting) {
      return entities;
    }

    return this.context.formatResult<T[]>(entities);
  }

  async getOne<T extends Record<string, unknown>>(options?: {
    noFormatting?: boolean;
  }): Promise<T | null> {
    const previousLimit = this.limitValue;

    this.limitValue = 1;

    let rows: Record<string, unknown>[];

    try {
      rows = await this.executeSelect();
    } finally {
      this.limitValue = previousLimit;
    }

    if (rows.length === 0) {
      return null;
    }

    const entity = this.mapRowToEntity<T>(rows[0]);

    if (options?.noFormatting) {
      return entity;
    }

    return this.context.formatResult<T>(entity);
  }

  async getRawMany<T extends Record<string, unknown>>(): Promise<T[]> {
    return (await this.executeSelect()) as T[];
  }

  async getRawOne<T extends Record<string, unknown>>(): Promise<T | undefined> {
    const previousLimit = this.limitValue;

    this.limitValue = this.limitValue ?? 1;

    try {
      const rows = await this.executeSelect();

      return rows[0] as T | undefined;
    } finally {
      this.limitValue = previousLimit;
    }
  }

  async getCount(): Promise<number> {
    const countBuilder = this.clone();

    countBuilder.findOptions = {};
    countBuilder.extraSelectClauses.length = 0;
    countBuilder.orderByClauses = [];
    countBuilder.limitValue = undefined;
    countBuilder.offsetValue = undefined;

    this.context.onBeforeExecute(countBuilder);

    const sql = [
      `SELECT COUNT(DISTINCT ${countBuilder.quoteColumn(countBuilder.alias, 'id')}) AS "count"`,
      countBuilder.buildFromClause(),
      countBuilder.buildJoinClause(),
      countBuilder.buildWhereClause(),
    ]
      .filter((part) => part.length > 0)
      .join(' ');

    const compiled = compileNamedParameters(sql, countBuilder.parameters);
    const rows = await this.context.executor.execute(compiled);

    return Number(rows[0]?.count ?? 0);
  }

  // Adds a predicate to a join's ON clause. In WHERE it would drop parent rows whose
  // joined record is filtered out, turning the LEFT JOIN into an inner join.
  addJoinCondition(alias: string, condition: string): this {
    const joinClause = this.joinClauses.find(
      (candidate) => candidate.alias === alias,
    );

    if (isDefined(joinClause)) {
      joinClause.additionalOnConditions.push(condition);
    }

    return this;
  }

  getJoinedTableShape(alias: string): WorkspaceTableShape | undefined {
    return this.joinClauses.find((joinClause) => joinClause.alias === alias)
      ?.targetTableShape;
  }

  // Row-level predicates are rendered once per alias: getMany() and getCount() both run
  // the hook, and a clone must not inherit a second copy of the same predicate.
  markRowLevelPermissionApplied(alias: string): boolean {
    if (this.aliasesWithRowLevelPermissionApplied.has(alias)) {
      return false;
    }

    this.aliasesWithRowLevelPermissionApplied.add(alias);

    return true;
  }

  // Columns referenced per alias across the projection, extra selects and ORDER BY. The
  // permission layer needs this because a joined alias is a different object with its own
  // field permissions, and ordering by one of its columns reads it just as a select does.
  getReferencedColumnNamesByAlias(): Record<string, string[]> {
    const columnNamesByAlias: Record<string, Set<string>> = {
      [this.alias]: new Set(this.getSelectedColumnNames()),
    };

    const expressions = [
      ...this.extraSelectClauses.map((extraSelect) => extraSelect.expression),
      ...this.orderByClauses.map((orderByClause) => orderByClause.expression),
    ];

    for (const expression of expressions) {
      for (const [, alias, columnName] of expression.matchAll(
        QUALIFIED_COLUMN_REFERENCE,
      )) {
        columnNamesByAlias[alias] = (
          columnNamesByAlias[alias] ?? new Set<string>()
        ).add(columnName);
      }
    }

    return Object.fromEntries(
      Object.entries(columnNamesByAlias).map(([alias, columnNames]) => [
        alias,
        [...columnNames],
      ]),
    );
  }

  getSelectedColumnNames(): string[] {
    const aggregateColumnNames = this.extraSelectClauses.flatMap(
      (extraSelect) => extractColumnNamesFromExpression(extraSelect.expression),
    );

    return [
      ...new Set([
        ...this.buildProjection().mainAliasColumnNames,
        ...aggregateColumnNames,
      ]),
    ];
  }

  private appendWhere(
    operator: 'and' | 'or',
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ): this {
    if (isDefined(parameters)) {
      this.setParameters(parameters);
    }

    if (isWhereFactoryLike(condition)) {
      const nestedBuilder = new WorkspaceSelectQueryBuilderV2(
        this.alias,
        this.context,
      );

      condition.whereFactory(nestedBuilder);

      // A nested group is a fragment of this query's WHERE, so it must not carry its own
      // copy of the soft-delete predicate: inside an OR group that would change the result.
      const nestedSql = nestedBuilder.buildWhereExpression({
        includeSoftDeletePredicate: false,
      });

      this.setParameters(nestedBuilder.parameters);

      if (nestedSql.length > 0) {
        this.whereClauses.push({
          operator,
          sql: isNegatedWhereFactoryLike(condition)
            ? `NOT (${nestedSql})`
            : `(${nestedSql})`,
        });
      }

      return this;
    }

    if (condition.length > 0) {
      this.whereClauses.push({ operator, sql: `(${condition})` });
    }

    return this;
  }

  private appendOrderBy(
    orderByOrExpression: OrderByConditionLike | string,
    direction: 'ASC' | 'DESC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): this {
    if (typeof orderByOrExpression === 'string') {
      this.orderByClauses.push({
        expression: this.normaliseColumnExpression(orderByOrExpression),
        direction,
        nulls,
      });

      return this;
    }

    for (const [expression, value] of Object.entries(orderByOrExpression)) {
      const normalisedExpression = this.normaliseColumnExpression(expression);

      if (typeof value === 'string') {
        this.orderByClauses.push({
          expression: normalisedExpression,
          direction: value,
        });
        continue;
      }

      this.orderByClauses.push({
        expression: normalisedExpression,
        direction: value.order ?? 'ASC',
        nulls: value.nulls,
      });
    }

    return this;
  }

  private async executeSelect(): Promise<Record<string, unknown>[]> {
    this.context.onBeforeExecute(this);

    const { sql, parameters } = this.buildSelectStatement();
    const compiled = compileNamedParameters(sql, parameters);

    return this.context.executor.execute(compiled);
  }

  private buildSelectStatement(): {
    sql: string;
    parameters: Record<string, unknown>;
  } {
    const sql = [
      `SELECT ${this.buildProjection().expressions.join(', ')}`,
      this.buildFromClause(),
      this.buildJoinClause(),
      this.buildWhereClause(),
      this.buildGroupByClause(),
      this.buildOrderByClause(),
      isDefined(this.limitValue) ? `LIMIT ${Number(this.limitValue)}` : '',
      isDefined(this.offsetValue) ? `OFFSET ${Number(this.offsetValue)}` : '',
    ]
      .filter((part) => part.length > 0)
      .join(' ');

    return { sql, parameters: this.parameters };
  }

  private buildProjection(): {
    expressions: string[];
    mainAliasColumnNames: string[];
  } {
    const selectedColumnNames = Object.entries(this.findOptions.select ?? {})
      .filter(([, isSelected]) => isSelected === true)
      .map(([columnName]) => columnName);

    for (const columnName of selectedColumnNames) {
      if (!isDefined(this.tableShape.columnShapeByColumnName[columnName])) {
        throw new TwentyOrmV2Exception(
          `Column "${columnName}" does not exist on "${this.tableShape.nameSingular}"`,
          TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
        );
      }
    }

    const mainAliasColumnNames =
      this.explicitSelection ??
      (selectedColumnNames.length > 0
        ? selectedColumnNames
        : this.tableShape.columnNames);

    const expressions = mainAliasColumnNames.map(
      (columnName) =>
        `${this.quoteColumn(this.alias, columnName)} AS ${escapeIdentifier(
          `${this.alias}_${columnName}`,
        )}`,
    );

    for (const extraSelect of this.extraSelectClauses) {
      expressions.push(
        `${extraSelect.expression} AS ${escapeIdentifier(extraSelect.alias)}`,
      );
    }

    return { expressions, mainAliasColumnNames };
  }

  private buildFromClause(): string {
    return `FROM ${escapeIdentifier(this.tableShape.schemaName)}.${escapeIdentifier(
      this.tableShape.tableName,
    )} AS ${escapeIdentifier(this.alias)}`;
  }

  private buildJoinClause(): string {
    return this.joinClauses
      .map((joinClause) => {
        const onConditions = [
          joinClause.condition,
          ...joinClause.additionalOnConditions,
        ];

        if (
          !this.includeDeleted &&
          joinClause.targetTableShape.hasDeletedAtColumn
        ) {
          onConditions.push(
            `${this.quoteColumn(joinClause.alias, 'deletedAt')} IS NULL`,
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
  }

  private buildWhereClause(): string {
    const expression = this.buildWhereExpression();

    return expression.length > 0 ? `WHERE ${expression}` : '';
  }

  private buildWhereExpression({
    includeSoftDeletePredicate = true,
  }: { includeSoftDeletePredicate?: boolean } = {}): string {
    const userExpression = this.whereClauses
      .map((clause, index) =>
        index === 0
          ? clause.sql
          : `${clause.operator.toUpperCase()} ${clause.sql}`,
      )
      .join(' ');

    const shouldAddSoftDeletePredicate =
      includeSoftDeletePredicate &&
      !this.includeDeleted &&
      this.tableShape.hasDeletedAtColumn;

    if (!shouldAddSoftDeletePredicate) {
      return userExpression;
    }

    const softDeletePredicate = `${this.quoteColumn(this.alias, 'deletedAt')} IS NULL`;

    if (userExpression.length === 0) {
      return softDeletePredicate;
    }

    // AND binds tighter than OR, so the accumulated clauses have to be wrapped as a whole:
    // without this, "A OR B AND deletedAt IS NULL" leaves rows matching A unfiltered.
    return `(${userExpression}) AND ${softDeletePredicate}`;
  }

  private buildGroupByClause(): string {
    return this.groupByExpressions.length > 0
      ? `GROUP BY ${this.groupByExpressions.join(', ')}`
      : '';
  }

  private buildOrderByClause(): string {
    if (this.orderByClauses.length === 0) {
      return '';
    }

    return `ORDER BY ${this.orderByClauses
      .map(
        (orderByClause) =>
          `${orderByClause.expression} ${orderByClause.direction}${
            isDefined(orderByClause.nulls) ? ` ${orderByClause.nulls}` : ''
          }`,
      )
      .join(', ')}`;
  }

  // Accepts the forms the shared parsers emit: "alias.column", "column", and
  // already-quoted `"alias"."column"`.
  private normaliseColumnExpression(expression: string): string {
    if (expression.includes('"') || expression.includes('(')) {
      return expression;
    }

    const parts = expression.split('.');

    if (parts.length === 2) {
      return this.quoteColumn(parts[0], parts[1]);
    }

    return this.quoteColumn(this.alias, expression);
  }

  private quoteColumn(alias: string, columnName: string): string {
    return `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;
  }

  private mapRowToEntity<T extends Record<string, unknown>>(
    row: Record<string, unknown>,
  ): T {
    const entity: Record<string, unknown> = {};
    const mainAliasPrefix = `${this.alias}_`;

    for (const [columnAlias, value] of Object.entries(row)) {
      if (columnAlias.startsWith(mainAliasPrefix)) {
        entity[columnAlias.slice(mainAliasPrefix.length)] = value;
        continue;
      }

      entity[columnAlias] = value;
    }

    return entity as T;
  }
}
