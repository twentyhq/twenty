import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, pascalCase } from 'twenty-shared/utils';
import { FindOperator } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';
import {
  type ExpressionMapLike,
  type FindOptionsLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
  type WhereConditionLike,
  type WhereExpressionLike,
  isNegatedWhereFactoryLike,
  isObjectWhereLike,
  isWhereFactoryLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';
import { WorkspaceMutationQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-mutation-query-builder-v2';
import { type MutationKind } from 'src/engine/twenty-orm-v2/sql/utils/build-mutation-statement.util';
import { buildOrderByClauses } from 'src/engine/twenty-orm-v2/sql/utils/build-order-by-clauses.util';
import { collectReferencedColumnNames } from 'src/engine/twenty-orm-v2/sql/utils/collect-referenced-column-names.util';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import {
  RESERVED_PARAMETER_NAMES,
  buildColumnNameByResultAlias,
  buildCountStatement,
  buildPaginationParameters,
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

let objectWhereParameterSequence = 0;

export type QueryBuilderV2Context = {
  tableShape: WorkspaceTableShape;
  executor: QueryExecutorV2;
  objectRecordsPermissions: ObjectsPermissions;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  onBeforeExecute: (queryBuilder: WorkspaceSelectQueryBuilderV2) => void;
  formatResult: <T>(records: unknown) => T;
};

export class WorkspaceSelectQueryBuilderV2 implements WhereExpressionLike {
  readonly alias: string;
  readonly tableShape: WorkspaceTableShape;
  readonly objectRecordsPermissions: ObjectsPermissions;

  private readonly context: QueryBuilderV2Context;
  private readonly whereClauses: WhereClause[] = [];
  private readonly joinClauses: JoinClause[] = [];
  private readonly extraSelectClauses: SelectClause[] = [];
  private orderByClauses: OrderByClause[] = [];
  private groupByExpressions: string[] = [];
  private parameters: Record<string, unknown> = {};
  private findOptions: FindOptionsLike = {};
  private limitValue?: number;
  private offsetValue?: number;
  private includeDeleted = false;
  private explicitSelection?: string[];
  private readonly aliasesWithRowLevelPermissionApplied = new Set<string>();

  constructor(alias: string, context: QueryBuilderV2Context) {
    this.alias = alias;
    this.tableShape = context.tableShape;
    this.objectRecordsPermissions = context.objectRecordsPermissions;
    this.context = context;
  }

  get expressionMap(): ExpressionMapLike {
    return {
      queryType: 'select',
      joinAttributes: this.joinClauses.map((joinClause) => ({
        alias: { name: joinClause.alias },
        relation: {
          isOneToMany: joinClause.relationType === RelationType.ONE_TO_MANY,
          isManyToMany: false,
        },
      })),
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
    cloned.groupByExpressions = [...this.groupByExpressions];
    cloned.parameters = { ...this.parameters };
    cloned.findOptions = { ...this.findOptions };
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.includeDeleted = this.includeDeleted;
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
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ): this {
    this.whereClauses.length = 0;
    this.aliasesWithRowLevelPermissionApplied.delete(this.alias);

    return this.appendWhere('and', condition, parameters);
  }

  copyWhereFrom(source: WorkspaceSelectQueryBuilderV2): this {
    this.whereClauses.push(...source.whereClauses);
    this.parameters = { ...this.parameters, ...source.parameters };

    return this;
  }

  andWhere(
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ): this {
    return this.appendWhere('and', condition, parameters);
  }

  orWhere(
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ): this {
    return this.appendWhere('or', condition, parameters);
  }

  setParameters(parameters: Record<string, unknown>): this {
    for (const parameterName of Object.keys(parameters)) {
      if (RESERVED_PARAMETER_NAMES.includes(parameterName)) {
        throw new TwentyOrmV2Exception(
          `Parameter name "${parameterName}" is reserved for pagination`,
          TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
        );
      }
    }

    this.parameters = { ...this.parameters, ...parameters };

    return this;
  }

  setParameter(key: string, value: unknown): this {
    return this.setParameters({ [key]: value });
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

  leftJoin(
    relationPath: string,
    alias: string,
    condition?: string,
    options?: { allowToManyJoin?: boolean },
  ): this {
    return this.addJoin('LEFT', relationPath, alias, condition, options);
  }

  innerJoin(
    relationPath: string,
    alias: string,
    condition?: string,
    options?: { allowToManyJoin?: boolean },
  ): this {
    return this.addJoin('INNER', relationPath, alias, condition, options);
  }

  private addJoin(
    joinType: 'INNER' | 'LEFT',
    relationPath: string,
    alias: string,
    condition?: string,
    options?: { allowToManyJoin?: boolean },
  ): this {
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

    const parentTableShape = this.getTableShapeForAlias(parentAlias);

    if (!isDefined(parentTableShape)) {
      throw new TwentyOrmV2Exception(
        `Join path "${relationPath}" references "${parentAlias}", which is neither the main alias nor a joined alias`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    const relationShape =
      parentTableShape.relationShapeByFieldName[relationFieldName];

    if (!isDefined(relationShape)) {
      throw new TwentyOrmV2Exception(
        `Relation "${relationFieldName}" does not exist on "${parentTableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_RELATION,
      );
    }

    const targetTableShape = this.context.tableShapeByObjectMetadataId(
      relationShape.targetObjectMetadataId,
    );

    const joinColumnName = relationShape.joinColumnName;

    // A to-one relation carries its join column on the current table, so the condition
    // is always renderable. A to-many relation carries the foreign key on the target
    // table; it is only built when the caller opts in (group-by "with records" ordering)
    // and renders as a DISTINCT ON derived table so it stays one row per parent.
    // Otherwise the condition is left undefined and the shared to-one guard rejects it.
    const toManyJoin =
      options?.allowToManyJoin === true
        ? this.buildToManyJoin({
            parentAlias,
            alias,
            targetTableShape,
            targetFieldMetadataId: relationShape.targetFieldMetadataId,
          })
        : undefined;

    this.joinClauses.push({
      alias,
      parentAlias,
      relationFieldName,
      targetTableShape,
      relationType: relationShape.relationType,
      joinType,
      condition: isDefined(joinColumnName)
        ? (condition ??
          `${this.quoteColumn(parentAlias, joinColumnName)} = ${this.quoteColumn(alias, 'id')}`)
        : (condition ?? toManyJoin?.condition),
      toManyForeignKeyColumnName: toManyJoin?.foreignKeyColumnName,
      additionalOnConditions: [],
    });

    return this;
  }

  private getTableShapeForAlias(
    alias: string,
  ): WorkspaceTableShape | undefined {
    if (alias === this.alias) {
      return this.tableShape;
    }

    return this.joinClauses.find((joinClause) => joinClause.alias === alias)
      ?.targetTableShape;
  }

  private buildToManyJoin({
    parentAlias,
    alias,
    targetTableShape,
    targetFieldMetadataId,
  }: {
    parentAlias: string;
    alias: string;
    targetTableShape: WorkspaceTableShape;
    targetFieldMetadataId: string | null;
  }): { condition: string; foreignKeyColumnName: string } | undefined {
    if (!isDefined(targetFieldMetadataId)) {
      return undefined;
    }

    const inverseRelationShape = Object.values(
      targetTableShape.relationShapeByFieldName,
    ).find(
      (relationShape) =>
        relationShape.fieldMetadataId === targetFieldMetadataId,
    );

    const foreignKeyColumnName = inverseRelationShape?.joinColumnName;

    if (!isDefined(foreignKeyColumnName)) {
      return undefined;
    }

    return {
      condition: `${this.quoteColumn(alias, foreignKeyColumnName)} = ${this.quoteColumn(parentAlias, 'id')}`,
      foreignKeyColumnName,
    };
  }

  withDeleted(): this {
    this.includeDeleted = true;

    return this;
  }

  limit(count: number): this {
    this.limitValue = count;

    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;

    return this;
  }

  take(count: number): this {
    return this.limit(count);
  }

  skip(count: number): this {
    return this.offset(count);
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
    const columnNameByResultAlias = this.buildColumnNameByResultAlias();
    const entities = rows.map((row) =>
      mapRowToEntity<T>(row, columnNameByResultAlias),
    );

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

    const entity = mapRowToEntity<T>(
      rows[0],
      this.buildColumnNameByResultAlias(),
    );

    if (options?.noFormatting) {
      return entity;
    }

    return this.context.formatResult<T>(entity);
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

  async getRawMany<T extends Record<string, unknown>>(): Promise<T[]> {
    const rows = await this.executeSelect();

    return rows as T[];
  }

  applyRowLevelPermissions(): this {
    this.context.onBeforeExecute(this);

    return this;
  }

  async getCount(): Promise<number> {
    this.context.onBeforeExecute(this);

    const sql = buildCountStatement(this.toSelectStatementState());
    const compiled = compileNamedParameters(sql, this.parameters);
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
    return collectReferencedColumnNames({
      mainAlias: this.alias,
      mainAliasColumnNames: this.buildProjection().mainAliasColumnNames,
      extraSelectClauses: this.extraSelectClauses,
      orderByClauses: this.orderByClauses,
    });
  }

  getSelectedColumnNames(): string[] {
    return this.getReferencedColumnNamesByAlias()[this.alias] ?? [];
  }

  update(): WorkspaceMutationQueryBuilderV2 {
    return this.toMutationQueryBuilder('update');
  }

  delete(): WorkspaceMutationQueryBuilderV2 {
    return this.toMutationQueryBuilder('delete');
  }

  softDelete(): WorkspaceMutationQueryBuilderV2 {
    return this.toMutationQueryBuilder('soft-delete');
  }

  restore(): WorkspaceMutationQueryBuilderV2 {
    return this.toMutationQueryBuilder('restore');
  }

  private toMutationQueryBuilder(
    kind: MutationKind,
  ): WorkspaceMutationQueryBuilderV2 {
    if (this.joinClauses.length > 0) {
      throw new TwentyOrmV2Exception(
        `A mutation cannot carry a relation join; rewrite the filter as an "id IN (subquery)" predicate first`,
        TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    return new WorkspaceMutationQueryBuilderV2({
      alias: this.alias,
      kind,
      context: {
        tableShape: this.tableShape,
        executor: this.context.executor,
        formatResult: this.context.formatResult,
      },
      whereClauses: this.whereClauses,
      parameters: this.parameters,
    });
  }

  private appendWhere(
    operator: 'and' | 'or',
    condition: WhereConditionLike,
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

    if (isObjectWhereLike(condition)) {
      const { sql, parameters: objectParameters } =
        this.buildObjectWhereClause(condition);

      this.setParameters(objectParameters);

      if (sql.length > 0) {
        this.whereClauses.push({ operator, sql: `(${sql})` });
      }

      return this;
    }

    if (condition.length > 0) {
      this.whereClauses.push({ operator, sql: `(${condition})` });
    }

    return this;
  }

  private buildObjectWhereClause(where: ObjectWhereLike): {
    sql: string;
    parameters: Record<string, unknown>;
  } {
    const conditions: string[] = [];
    const parameters: Record<string, unknown> = {};

    for (const [columnName, value] of Object.entries(where)) {
      if (isDefined(this.tableShape.columnShapeByColumnName[columnName])) {
        conditions.push(
          this.buildValueCondition(
            quoteColumn(this.alias, columnName),
            columnName,
            value,
            parameters,
          ),
        );

        continue;
      }

      const hasCompositeChildColumns = Object.values(
        this.tableShape.columnShapeByColumnName,
      ).some((shape) => shape.compositeParentFieldName === columnName);

      if (
        hasCompositeChildColumns &&
        isDefined(value) &&
        typeof value === 'object' &&
        !(value instanceof FindOperator) &&
        !Array.isArray(value)
      ) {
        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          const compositeColumnName = `${columnName}${pascalCase(subFieldName)}`;

          if (
            !isDefined(
              this.tableShape.columnShapeByColumnName[compositeColumnName],
            )
          ) {
            throw new TwentyOrmV2Exception(
              `Column "${compositeColumnName}" does not exist on "${this.tableShape.nameSingular}"`,
              TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
            );
          }

          conditions.push(
            this.buildValueCondition(
              quoteColumn(this.alias, compositeColumnName),
              compositeColumnName,
              subValue,
              parameters,
            ),
          );
        }

        continue;
      }

      throw new TwentyOrmV2Exception(
        `Column "${columnName}" does not exist on "${this.tableShape.nameSingular}"`,
        TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
      );
    }

    return { sql: conditions.join(' AND '), parameters };
  }

  private buildValueCondition(
    quotedColumn: string,
    columnName: string,
    value: unknown,
    parameters: Record<string, unknown>,
  ): string {
    if (value === null) {
      return `${quotedColumn} IS NULL`;
    }

    const nextParameter = (parameterValue: unknown): string => {
      const parameterName = `ormV2ObjectWhere_${objectWhereParameterSequence++}`;

      parameters[parameterName] = parameterValue;

      return parameterName;
    };

    if (value instanceof FindOperator) {
      switch (value.type) {
        case 'in':
          return `${quotedColumn} IN (:...${nextParameter(value.value)})`;
        case 'any':
          return `${quotedColumn} = ANY(:${nextParameter(value.value)})`;
        case 'equal':
          return `${quotedColumn} = :${nextParameter(value.value)}`;
        case 'lessThan':
          return `${quotedColumn} < :${nextParameter(value.value)}`;
        case 'lessThanOrEqual':
          return `${quotedColumn} <= :${nextParameter(value.value)}`;
        case 'moreThan':
          return `${quotedColumn} > :${nextParameter(value.value)}`;
        case 'moreThanOrEqual':
          return `${quotedColumn} >= :${nextParameter(value.value)}`;
        case 'like':
          return `${quotedColumn} LIKE :${nextParameter(value.value)}`;
        case 'ilike':
          return `${quotedColumn} ILIKE :${nextParameter(value.value)}`;
        case 'arrayContains':
          return `${quotedColumn} @> :${nextParameter(value.value)}`;
        case 'isNull':
          return `${quotedColumn} IS NULL`;
        case 'between': {
          const [from, to] = value.value as [unknown, unknown];

          return `${quotedColumn} BETWEEN :${nextParameter(
            from,
          )} AND :${nextParameter(to)}`;
        }
        case 'not':
          return `NOT (${this.buildValueCondition(
            quotedColumn,
            columnName,
            value.child ?? value.value,
            parameters,
          )})`;
        case 'and':
        case 'or': {
          const childOperators = value.value as unknown[];
          const separator = value.type === 'and' ? ' AND ' : ' OR ';

          return `(${childOperators
            .map((childOperator) =>
              this.buildValueCondition(
                quotedColumn,
                columnName,
                childOperator,
                parameters,
              ),
            )
            .join(separator)})`;
        }
        case 'raw': {
          const rawValue = value.value as unknown;

          let rawSql: string;

          if (typeof rawValue === 'function') {
            rawSql = (rawValue as (columnAlias: string) => string)(
              quotedColumn,
            );
          } else if (typeof rawValue === 'string') {
            rawSql = rawValue;
          } else {
            rawSql = value.getSql?.(quotedColumn) ?? '';
          }

          Object.assign(parameters, value.objectLiteralParameters ?? {});

          return rawSql;
        }
        default:
          throw new TwentyOrmV2Exception(
            `Object where does not support the "${value.type}" operator on "${columnName}"`,
            TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
          );
      }
    }

    return `${quotedColumn} = :${nextParameter(value)}`;
  }

  private appendOrderBy(
    orderByOrExpression: OrderByConditionLike | string,
    direction: 'ASC' | 'DESC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): this {
    this.orderByClauses.push(
      ...buildOrderByClauses({
        orderByOrExpression,
        direction,
        nulls,
        normaliseColumnExpression: (expression) =>
          this.normaliseColumnExpression(expression),
      }),
    );

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
    const state = this.toSelectStatementState();

    return {
      sql: buildSelectStatement(state),
      parameters: { ...this.parameters, ...buildPaginationParameters(state) },
    };
  }

  private buildProjection(): {
    expressions: string[];
    mainAliasColumnNames: string[];
  } {
    return buildProjection(this.toSelectStatementState());
  }

  private buildColumnNameByResultAlias(): Record<string, string> {
    return buildColumnNameByResultAlias(
      this.alias,
      this.buildProjection().mainAliasColumnNames,
    );
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
      groupByExpressions: this.groupByExpressions,
      orderByClauses: this.orderByClauses,
      includeDeleted: this.includeDeleted,
      limitValue: this.limitValue,
      offsetValue: this.offsetValue,
    };
  }
}
