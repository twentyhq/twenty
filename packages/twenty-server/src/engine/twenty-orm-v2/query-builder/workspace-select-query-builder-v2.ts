import { isDefined } from 'twenty-shared/utils';

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
import {
  buildCountStatement,
  buildProjection,
  buildSelectStatement,
  buildWhereExpression,
  mapRowToEntity,
  normaliseColumnExpression,
  quoteColumn,
  type JoinClause,
  type OrderByClause,
  type SelectClause,
  type SelectStatementState,
  type WhereClause,
} from 'src/engine/twenty-orm-v2/sql/utils/build-select-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const QUALIFIED_COLUMN_REFERENCE = /"(\w+)"\."(\w+)"/g;

export type QueryBuilderV2Context = {
  tableShape: WorkspaceTableShape;
  executor: QueryExecutorV2;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  onBeforeExecute: (queryBuilder: WorkspaceSelectQueryBuilderV2) => void;
  formatResult: <T>(records: unknown) => T;
};

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
    // Joined predicates live in ON and survive this, so only the main marker is cleared.
    this.whereClauses.length = 0;
    this.aliasesWithRowLevelPermissionApplied.delete(this.alias);

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
    const entities = rows.map((row) => mapRowToEntity<T>(row, this.alias));

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

    const entity = mapRowToEntity<T>(rows[0], this.alias);

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

    const sql = buildCountStatement(countBuilder.toSelectStatementState());

    const compiled = compileNamedParameters(sql, countBuilder.parameters);
    const rows = await this.context.executor.execute(compiled);

    return Number(rows[0]?.count ?? 0);
  }

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

  markRowLevelPermissionApplied(alias: string): boolean {
    if (this.aliasesWithRowLevelPermissionApplied.has(alias)) {
      return false;
    }

    this.aliasesWithRowLevelPermissionApplied.add(alias);

    return true;
  }

  getReferencedColumnNamesByAlias(): Record<string, string[]> {
    const columnNamesByAlias: Record<string, Set<string>> = {
      [this.alias]: new Set(this.buildProjection().mainAliasColumnNames),
    };

    const addColumnName = (alias: string, columnName: string) => {
      columnNamesByAlias[alias] = (
        columnNamesByAlias[alias] ?? new Set<string>()
      ).add(columnName);
    };

    const expressions = [
      ...this.extraSelectClauses.map((extraSelect) => extraSelect.expression),
      ...this.orderByClauses.map((orderByClause) => orderByClause.expression),
    ];

    for (const expression of expressions) {
      const qualifiedReferences = [
        ...expression.matchAll(QUALIFIED_COLUMN_REFERENCE),
      ];

      // Attributing a qualified column to the main alias would check the wrong object.
      if (qualifiedReferences.length > 0) {
        for (const [, alias, columnName] of qualifiedReferences) {
          addColumnName(alias, columnName);
        }

        continue;
      }

      for (const columnName of ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
        expression,
      ) ?? []) {
        addColumnName(this.alias, columnName);
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
    return this.getReferencedColumnNamesByAlias()[this.alias] ?? [];
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

      // A nested group is a fragment of this WHERE, so it carries no soft-delete copy.
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
    return {
      sql: buildSelectStatement(this.toSelectStatementState()),
      parameters: this.parameters,
    };
  }

  private buildProjection(): {
    expressions: string[];
    mainAliasColumnNames: string[];
  } {
    return buildProjection(this.toSelectStatementState());
  }

  private buildWhereExpression(options?: {
    includeSoftDeletePredicate?: boolean;
  }): string {
    return buildWhereExpression(this.toSelectStatementState(), options);
  }

  private normaliseColumnExpression(expression: string): string {
    return normaliseColumnExpression(expression, this.alias);
  }

  private quoteColumn(alias: string, columnName: string): string {
    return quoteColumn(alias, columnName);
  }

  private toSelectStatementState(): SelectStatementState {
    return {
      alias: this.alias,
      tableShape: this.tableShape,
      findOptions: this.findOptions,
      explicitSelection: this.explicitSelection,
      extraSelectClauses: this.extraSelectClauses,
      joinClauses: this.joinClauses,
      whereClauses: this.whereClauses,
      orderByClauses: this.orderByClauses,
      groupByExpressions: this.groupByExpressions,
      includeDeleted: this.includeDeleted,
      limitValue: this.limitValue,
      offsetValue: this.offsetValue,
    };
  }
}
