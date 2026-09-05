import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, pascalCase } from 'twenty-shared/utils';
import { FindOperator, type ObjectLiteral } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import {
  type FindOptionsLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
  type WhereConditionLike,
  type WhereExpressionLike,
  isNegatedWhereFactoryLike,
  isObjectWhereLike,
  isWhereFactoryLike,
} from 'src/engine/twenty-orm/query-builder/types/query-builder.type';
import { WorkspaceMutationQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-mutation-query-builder';
import { type MutationKind } from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
import { buildOrderByClauses } from 'src/engine/twenty-orm/sql/utils/build-order-by-clauses.util';
import { collectReferencedColumnNames } from 'src/engine/twenty-orm/sql/utils/collect-referenced-column-names.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import {
  RESERVED_PARAMETER_NAMES,
  buildCountStatement,
  buildHydrationPathByResultAlias,
  buildPaginationParameters,
  buildProjection,
  buildSelectStatement,
  buildWhereExpression,
  collectStatementAliases,
  mapRowToEntity,
  normaliseColumnExpression,
  quoteColumn,
  quoteQualifiedAliasReferences,
  type ColumnSelection,
  type ExistsFilterClause,
  type ToManyDedupOrder,
  type JoinClause,
  type OrderByClause,
  type SelectClause,
  type SelectStatementState,
  type WhereClause,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

let objectWhereParameterSequence = 0;
let existsFilterSequence = 0;

const isNestedWhereObject = (value: unknown): value is ObjectWhereLike =>
  isDefined(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof FindOperator) &&
  !(value instanceof Date);

export type QueryBuilderContext = {
  tableShape: WorkspaceTableShape;
  executor: QueryExecutor;
  objectRecordsPermissions: ObjectsPermissions;
  tableShapeByObjectMetadataId: (
    objectMetadataId: string,
  ) => WorkspaceTableShape;
  onBeforeExecute: (queryBuilder: WorkspaceSelectQueryBuilder) => void;
  formatResult: <T>(records: unknown) => T;
};

export class WorkspaceSelectQueryBuilder implements WhereExpressionLike {
  readonly alias: string;
  readonly tableShape: WorkspaceTableShape;
  readonly objectRecordsPermissions: ObjectsPermissions;

  private readonly context: QueryBuilderContext;
  private readonly whereClauses: WhereClause[] = [];
  private readonly joinClauses: JoinClause[] = [];
  private readonly existsFilterClauses: ExistsFilterClause[] = [];
  private readonly extraSelectClauses: SelectClause[] = [];
  private readonly pendingColumnSelections: string[] = [];
  private orderByClauses: OrderByClause[] = [];
  private groupByExpressions: string[] = [];
  private distinctOnExpressions: string[] = [];
  private parameters: Record<string, unknown> = {};
  private findOptions: FindOptionsLike = {};
  private limitValue?: number;
  private offsetValue?: number;
  private includeDeleted = false;
  private explicitSelection?: string[];
  private readonly aliasesWithRowLevelPermissionApplied = new Set<string>();

  constructor(alias: string, context: QueryBuilderContext) {
    this.alias = alias;
    this.tableShape = context.tableShape;
    this.objectRecordsPermissions = context.objectRecordsPermissions;
    this.context = context;
  }

  getJoinAliases(): { name: string; isToMany: boolean }[] {
    return [
      ...this.joinClauses.map((joinClause) => ({
        name: joinClause.alias,
        isToMany: joinClause.relationType === RelationType.ONE_TO_MANY,
      })),
      ...this.existsFilterClauses.map((existsFilterClause) => ({
        name: existsFilterClause.alias,
        isToMany: false,
      })),
    ];
  }

  clone(): WorkspaceSelectQueryBuilder {
    const cloned = new WorkspaceSelectQueryBuilder(this.alias, this.context);

    cloned.whereClauses.push(...this.whereClauses);
    cloned.existsFilterClauses.push(
      ...this.existsFilterClauses.map((existsFilterClause) => ({
        ...existsFilterClause,
        additionalOnConditions: [...existsFilterClause.additionalOnConditions],
      })),
    );
    cloned.joinClauses.push(
      ...this.joinClauses.map((joinClause) => ({
        ...joinClause,
        additionalOnConditions: [...joinClause.additionalOnConditions],
      })),
    );
    cloned.extraSelectClauses.push(...this.extraSelectClauses);
    cloned.pendingColumnSelections.push(...this.pendingColumnSelections);
    cloned.orderByClauses = [...this.orderByClauses];
    cloned.groupByExpressions = [...this.groupByExpressions];
    cloned.distinctOnExpressions = [...this.distinctOnExpressions];
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

  copyWhereFrom(source: WorkspaceSelectQueryBuilder): this {
    this.whereClauses.push(...source.whereClauses);
    this.existsFilterClauses.push(
      ...source.existsFilterClauses.map((existsFilterClause) => ({
        ...existsFilterClause,
        additionalOnConditions: [...existsFilterClause.additionalOnConditions],
      })),
    );
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
        throw new TwentyOrmException(
          `Parameter name "${parameterName}" is reserved for pagination`,
          TwentyOrmExceptionCode.INVALID_PARAMETER,
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
    this.pendingColumnSelections.length = 0;

    if (selection === undefined) {
      this.explicitSelection = undefined;

      return this;
    }

    if (Array.isArray(selection)) {
      this.explicitSelection = selection;

      return this;
    }

    if (selection === this.alias && alias === undefined) {
      this.explicitSelection = [...this.tableShape.columnNames];

      return this;
    }

    this.explicitSelection = [];
    this.extraSelectClauses.push({
      expression: this.normaliseColumnExpression(selection),
      alias: alias ?? selection,
    });

    return this;
  }

  addSelect(expression: string, alias?: string): this {
    if (isDefined(alias)) {
      this.extraSelectClauses.push({ expression, alias });

      return this;
    }

    if (/^\w+\.\w+$/.test(expression)) {
      this.pendingColumnSelections.push(expression);

      return this;
    }

    this.extraSelectClauses.push({ expression, alias: expression });

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

  distinctOn(columns: string[]): this {
    this.distinctOnExpressions = columns.map((column) =>
      this.normaliseColumnExpression(column),
    );

    return this;
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
    options?: {
      allowToManyJoin?: boolean;
      toManyDedupOrder?: ToManyDedupOrder[];
    },
  ): this {
    return this.addJoin('LEFT', relationPath, alias, condition, options);
  }

  innerJoin(
    relationPath: string,
    alias: string,
    condition?: string,
    options?: {
      allowToManyJoin?: boolean;
      toManyDedupOrder?: ToManyDedupOrder[];
    },
  ): this {
    return this.addJoin('INNER', relationPath, alias, condition, options);
  }

  leftJoinAndSelect(
    relationPath: string,
    alias: string,
    condition?: string,
  ): this {
    return this.addJoin('LEFT', relationPath, alias, condition, {
      select: true,
    });
  }

  innerJoinAndSelect(
    relationPath: string,
    alias: string,
    condition?: string,
  ): this {
    return this.addJoin('INNER', relationPath, alias, condition, {
      select: true,
    });
  }

  private addJoin(
    joinType: 'INNER' | 'LEFT',
    relationPath: string,
    alias: string,
    condition?: string,
    options?: {
      allowToManyJoin?: boolean;
      toManyDedupOrder?: ToManyDedupOrder[];
      select?: boolean;
    },
  ): this {
    const [parentAlias, relationFieldName] = relationPath.split('.');

    if (!isDefined(relationFieldName)) {
      throw new TwentyOrmException(
        `Join path "${relationPath}" must be of the form "<alias>.<relationField>"`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    if (alias === this.alias) {
      throw new TwentyOrmException(
        `Join alias "${alias}" collides with the main query alias`,
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    if (this.joinClauses.some((joinClause) => joinClause.alias === alias)) {
      return this;
    }

    const parentTableShape = this.getTableShapeForAlias(parentAlias);

    if (!isDefined(parentTableShape)) {
      throw new TwentyOrmException(
        `Join path "${relationPath}" references "${parentAlias}", which is neither the main alias nor a joined alias`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    const relationShape =
      parentTableShape.relationShapeByFieldName[relationFieldName];

    if (!isDefined(relationShape)) {
      throw new TwentyOrmException(
        `Relation "${relationFieldName}" does not exist on "${parentTableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    const targetTableShape = this.context.tableShapeByObjectMetadataId(
      relationShape.targetObjectMetadataId,
    );

    const joinColumnName = relationShape.joinColumnName;

    const toManyJoin = isDefined(joinColumnName)
      ? undefined
      : this.buildToManyJoin({
          parentAlias,
          alias,
          targetTableShape,
          targetFieldMetadataId: relationShape.targetFieldMetadataId,
        });

    const shouldJoinDedupedToMany = options?.allowToManyJoin === true;

    this.joinClauses.push({
      alias,
      parentAlias,
      relationFieldName,
      targetTableShape,
      relationType: relationShape.relationType,
      joinType,
      isSelected: options?.select === true,
      condition: isDefined(joinColumnName)
        ? (condition ??
          `${this.quoteColumn(parentAlias, joinColumnName)} = ${this.quoteColumn(alias, 'id')}`)
        : shouldJoinDedupedToMany
          ? (condition ?? toManyJoin?.condition)
          : undefined,
      toManyForeignKeyColumnName: shouldJoinDedupedToMany
        ? toManyJoin?.foreignKeyColumnName
        : undefined,
      toManyPlainCondition: condition ?? toManyJoin?.condition,
      toManyDedupOrder: shouldJoinDedupedToMany
        ? options?.toManyDedupOrder
        : undefined,
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

  private resolveColumnSelections(): ColumnSelection[] {
    return this.pendingColumnSelections.map((expression) => {
      const [alias, columnName] = expression.split('.');
      const tableShape = this.getTableShapeForAlias(alias);

      if (!isDefined(tableShape)) {
        throw new TwentyOrmException(
          `Selection "${expression}" references "${alias}", which is neither the main alias nor a joined alias`,
          TwentyOrmExceptionCode.UNKNOWN_RELATION,
        );
      }

      if (!isDefined(tableShape.columnShapeByColumnName[columnName])) {
        throw new TwentyOrmException(
          `Column "${columnName}" does not exist on "${tableShape.nameSingular}"`,
          TwentyOrmExceptionCode.UNKNOWN_COLUMN,
        );
      }

      return { alias, columnName };
    });
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

  private materializeEntities<T extends ObjectLiteral>(
    rows: Record<string, unknown>[],
  ): T[] {
    const columnNameByResultAlias = this.buildColumnNameByResultAlias();

    return rows.map((row) => mapRowToEntity<T>(row, columnNameByResultAlias));
  }

  async getMany<T extends ObjectLiteral>(options?: {
    noFormatting?: boolean;
  }): Promise<T[]> {
    const entities = this.materializeEntities<T>(await this.executeSelect());

    if (options?.noFormatting) {
      return entities;
    }

    return this.context.formatResult<T[]>(entities);
  }

  async getRawAndEntities<T extends Record<string, unknown>>(): Promise<{
    entities: T[];
    raw: Record<string, unknown>[];
  }> {
    const rows = await this.executeSelect();

    return {
      raw: rows,
      entities: this.context.formatResult<T[]>(this.materializeEntities(rows)),
    };
  }

  async getOne<T extends ObjectLiteral>(options?: {
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

    const [entity] = this.materializeEntities<T>([rows[0]]);

    if (options?.noFormatting) {
      return entity;
    }

    return this.context.formatResult<T>(entity);
  }

  async getRawOne<T extends Record<string, unknown>>(): Promise<T | undefined> {
    const previousLimit = this.limitValue;

    this.limitValue = this.limitValue ?? 1;

    try {
      const rows = await this.executeSelect({ allowPlainToManyJoins: true });

      return rows[0] as T | undefined;
    } finally {
      this.limitValue = previousLimit;
    }
  }

  async getRawMany<T extends Record<string, unknown>>(): Promise<T[]> {
    const rows = await this.executeSelect({ allowPlainToManyJoins: true });

    return rows as T[];
  }

  applyRowLevelPermissions(): this {
    this.context.onBeforeExecute(this);

    return this;
  }

  async getCount(): Promise<number> {
    this.context.onBeforeExecute(this);

    const sql = buildCountStatement(
      this.toSelectStatementState({ allowPlainToManyJoins: true }),
    );
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

    for (const existsFilterClause of this.existsFilterClauses) {
      if (existsFilterClause.alias === alias) {
        existsFilterClause.additionalOnConditions.push(condition);
      }
    }

    return this;
  }

  getJoinedTableShape(alias: string): WorkspaceTableShape | undefined {
    return (
      this.joinClauses.find((joinClause) => joinClause.alias === alias)
        ?.targetTableShape ??
      this.existsFilterClauses.find(
        (existsFilterClause) => existsFilterClause.alias === alias,
      )?.targetTableShape
    );
  }

  markRowLevelPermissionApplied(alias: string): boolean {
    if (this.aliasesWithRowLevelPermissionApplied.has(alias)) {
      return false;
    }

    this.aliasesWithRowLevelPermissionApplied.add(alias);

    return true;
  }

  getReferencedColumnNamesByAlias(): Record<string, string[]> {
    const state = this.toSelectStatementState();
    const aliases = collectStatementAliases(state);

    return collectReferencedColumnNames({
      mainAlias: this.alias,
      mainAliasColumnNames: this.buildProjection().mainAliasColumnNames,
      extraSelectClauses: this.extraSelectClauses.map((selectClause) => ({
        ...selectClause,
        expression: quoteQualifiedAliasReferences(
          selectClause.expression,
          aliases,
        ),
      })),
      orderByClauses: this.orderByClauses
        .filter(
          (orderByClause) =>
            !this.extraSelectClauses.some(
              (selectClause) =>
                escapeIdentifier(selectClause.alias) ===
                orderByClause.expression,
            ),
        )
        .map((orderByClause) => ({
          ...orderByClause,
          expression: quoteQualifiedAliasReferences(
            orderByClause.expression,
            aliases,
          ),
        })),
      distinctOnExpressions: this.distinctOnExpressions,
    });
  }

  getSelectedColumnNames(): string[] {
    return this.getReferencedColumnNamesByAlias()[this.alias] ?? [];
  }

  update(): WorkspaceMutationQueryBuilder {
    return this.toMutationQueryBuilder('update');
  }

  delete(): WorkspaceMutationQueryBuilder {
    return this.toMutationQueryBuilder('delete');
  }

  softDelete(): WorkspaceMutationQueryBuilder {
    return this.toMutationQueryBuilder('soft-delete');
  }

  restore(): WorkspaceMutationQueryBuilder {
    return this.toMutationQueryBuilder('restore');
  }

  private toMutationQueryBuilder(
    kind: MutationKind,
  ): WorkspaceMutationQueryBuilder {
    if (this.joinClauses.length > 0) {
      throw new TwentyOrmException(
        `A mutation cannot carry a relation join; rewrite the filter as an "id IN (subquery)" predicate first`,
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    // Row-level permission predicates are injected on the select path only, so an
    // EXISTS rendered here would filter the related table with no predicate at all.
    if (this.existsFilterClauses.length > 0) {
      throw new TwentyOrmException(
        `A mutation cannot carry a relation filter; rewrite the filter as an "id IN (subquery)" predicate first`,
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    return new WorkspaceMutationQueryBuilder({
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
      const nestedBuilder = new WorkspaceSelectQueryBuilder(
        this.alias,
        this.context,
      );

      condition.whereFactory(nestedBuilder);

      const nestedSql = nestedBuilder.buildWhereExpression({
        includeSoftDeletePredicate: false,
        substituteExistsFilters: false,
      });

      this.setParameters(nestedBuilder.parameters);
      this.existsFilterClauses.push(...nestedBuilder.existsFilterClauses);

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

      const relationShape =
        this.tableShape.relationShapeByFieldName[columnName];

      if (isDefined(relationShape) && isNestedWhereObject(value)) {
        conditions.push(
          this.buildRelationExistsCondition({
            relationFieldName: columnName,
            relationShape,
            applyWhere: (nestedBuilder) => nestedBuilder.where(value),
            parameters,
          }),
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
            throw new TwentyOrmException(
              `Column "${compositeColumnName}" does not exist on "${this.tableShape.nameSingular}"`,
              TwentyOrmExceptionCode.UNKNOWN_COLUMN,
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

      throw new TwentyOrmException(
        `Column "${columnName}" does not exist on "${this.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
      );
    }

    return { sql: conditions.join(' AND '), parameters };
  }

  // Registers a correlated EXISTS on a relation and returns the token to place
  // in a where clause; the caller writes the related table's condition on the
  // nested builder, whose alias names that table. Unlike a join, an EXISTS never
  // duplicates root rows, so this is how a to-many relation gets filtered.
  addRelationExistsFilter({
    relationFieldName,
    applyWhere,
  }: {
    relationFieldName: string;
    applyWhere: (nestedBuilder: WorkspaceSelectQueryBuilder) => void;
  }): string {
    const relationShape =
      this.tableShape.relationShapeByFieldName[relationFieldName];

    if (!isDefined(relationShape)) {
      throw new TwentyOrmException(
        `Unknown relation "${relationFieldName}" on "${this.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    const parameters: Record<string, unknown> = {};

    const token = this.buildRelationExistsCondition({
      relationFieldName,
      relationShape,
      applyWhere,
      parameters,
    });

    this.setParameters(parameters);

    return token;
  }

  private buildRelationExistsCondition({
    relationFieldName,
    relationShape,
    applyWhere,
    parameters,
  }: {
    relationFieldName: string;
    relationShape: WorkspaceTableShape['relationShapeByFieldName'][string];
    applyWhere: (nestedBuilder: WorkspaceSelectQueryBuilder) => void;
    parameters: Record<string, unknown>;
  }): string {
    const targetTableShape = this.context.tableShapeByObjectMetadataId(
      relationShape.targetObjectMetadataId,
    );

    const alias = this.buildExistsFilterAlias(relationFieldName);

    const correlationCondition = isDefined(relationShape.joinColumnName)
      ? `${this.quoteColumn(this.alias, relationShape.joinColumnName)} = ${this.quoteColumn(alias, 'id')}`
      : this.buildToManyJoin({
          parentAlias: this.alias,
          alias,
          targetTableShape,
          targetFieldMetadataId: relationShape.targetFieldMetadataId,
        })?.condition;

    if (!isDefined(correlationCondition)) {
      throw new TwentyOrmException(
        `Relation "${relationFieldName}" on "${this.tableShape.nameSingular}" cannot be filtered on because its inverse foreign key could not be resolved`,
        TwentyOrmExceptionCode.UNKNOWN_RELATION,
      );
    }

    const nestedBuilder = new WorkspaceSelectQueryBuilder(alias, {
      ...this.context,
      tableShape: targetTableShape,
    });

    applyWhere(nestedBuilder);

    Object.assign(parameters, nestedBuilder.parameters);

    const token = `__ormExistsFilter_${existsFilterSequence++}__`;

    this.existsFilterClauses.push(
      {
        token,
        alias,
        parentAlias: this.alias,
        relationFieldName,
        targetTableShape,
        correlationCondition,
        conditionSql: nestedBuilder.buildWhereExpression({
          includeSoftDeletePredicate: false,
          substituteExistsFilters: false,
        }),
        additionalOnConditions: [],
      },
      ...nestedBuilder.existsFilterClauses,
    );

    return token;
  }

  private buildExistsFilterAlias(relationFieldName: string): string {
    const baseAlias = `${this.alias}_${relationFieldName}_filter`;

    const takenAliases = new Set([
      this.alias,
      ...this.joinClauses.map((joinClause) => joinClause.alias),
      ...this.existsFilterClauses.map(
        (existsFilterClause) => existsFilterClause.alias,
      ),
    ]);

    if (!takenAliases.has(baseAlias)) {
      return baseAlias;
    }

    let suffix = 2;

    while (takenAliases.has(`${baseAlias}_${suffix}`)) {
      suffix++;
    }

    return `${baseAlias}_${suffix}`;
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
      const parameterName = `ormObjectWhere_${objectWhereParameterSequence++}`;

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
          throw new TwentyOrmException(
            `Object where does not support the "${value.type}" operator on "${columnName}"`,
            TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
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
          this.normaliseOrderByExpression(expression),
      }),
    );

    return this;
  }

  private normaliseOrderByExpression(expression: string): string {
    const isBareIdentifier = /^\w+$/.test(expression);

    if (
      isBareIdentifier &&
      this.extraSelectClauses.some(
        (selectClause) => selectClause.alias === expression,
      )
    ) {
      return escapeIdentifier(expression);
    }

    return this.normaliseColumnExpression(expression);
  }

  private async executeSelect(options?: {
    allowPlainToManyJoins?: boolean;
  }): Promise<Record<string, unknown>[]> {
    this.context.onBeforeExecute(this);

    const { sql, parameters } = this.buildSelectStatement(options);
    const compiled = compileNamedParameters(sql, parameters);

    return this.context.executor.execute(compiled);
  }

  private buildSelectStatement(options?: { allowPlainToManyJoins?: boolean }): {
    sql: string;
    parameters: Record<string, unknown>;
  } {
    const state = this.toSelectStatementState(options);

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
    return buildHydrationPathByResultAlias(this.toSelectStatementState());
  }

  private buildWhereExpression(options?: {
    includeSoftDeletePredicate?: boolean;
    substituteExistsFilters?: boolean;
  }): string {
    return buildWhereExpression(this.toSelectStatementState(), options);
  }

  private normaliseColumnExpression(expression: string): string {
    return normaliseColumnExpression(expression, this.alias);
  }

  private quoteColumn(alias: string, columnName: string): string {
    return quoteColumn(alias, columnName);
  }

  private toSelectStatementState(options?: {
    allowPlainToManyJoins?: boolean;
  }): SelectStatementState {
    return {
      alias: this.alias,
      tableShape: this.tableShape,
      findOptions: this.findOptions,
      explicitSelection: this.explicitSelection,
      extraSelectClauses: this.extraSelectClauses,
      columnSelections: this.resolveColumnSelections(),
      joinClauses: this.joinClauses,
      whereClauses: this.whereClauses,
      existsFilterClauses: this.existsFilterClauses,
      groupByExpressions: this.groupByExpressions,
      orderByClauses: this.orderByClauses,
      distinctOnExpressions: this.distinctOnExpressions,
      includeDeleted: this.includeDeleted,
      allowPlainToManyJoins: options?.allowPlainToManyJoins ?? false,
      limitValue: this.limitValue,
      offsetValue: this.offsetValue,
    };
  }
}
