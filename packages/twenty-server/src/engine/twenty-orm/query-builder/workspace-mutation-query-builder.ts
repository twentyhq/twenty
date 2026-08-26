import { isDefined } from 'twenty-shared/utils';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import {
  buildColumnNameByResultAlias,
  mapRowToEntity,
  type WhereClause,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { serializeJsonbWriteValue } from 'src/engine/twenty-orm/sql/utils/serialize-jsonb-write-value.util';
import {
  buildMutationStatement,
  type MutationKind,
  type SetClause,
} from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

let mutationSetParameterSequence = 0;

const UPDATED_AT_COLUMN_NAME = 'updatedAt';
const DELETED_AT_COLUMN_NAME = 'deletedAt';

export type MutationQueryBuilderContext = {
  tableShape: WorkspaceTableShape;
  executor: QueryExecutor;
  formatResult: <T>(records: unknown) => T;
};

export type MutationResult = {
  // oxlint-disable-next-line typescript/no-explicit-any
  generatedMaps: any[];
};

export class WorkspaceMutationQueryBuilder {
  readonly alias: string;
  readonly tableShape: WorkspaceTableShape;

  private readonly context: MutationQueryBuilderContext;
  private readonly kind: MutationKind;
  private readonly whereClauses: WhereClause[];
  private parameters: Record<string, unknown>;
  private setRecord: Record<string, unknown> = {};
  private returningColumns: string[] = [];

  constructor({
    alias,
    kind,
    context,
    whereClauses,
    parameters,
  }: {
    alias: string;
    kind: MutationKind;
    context: MutationQueryBuilderContext;
    whereClauses: WhereClause[];
    parameters: Record<string, unknown>;
  }) {
    this.alias = alias;
    this.kind = kind;
    this.context = context;
    this.tableShape = context.tableShape;
    this.whereClauses = [...whereClauses];
    this.parameters = { ...parameters };
  }

  set(record: Record<string, unknown>): this {
    this.setRecord = record;

    return this;
  }

  returning(columns: string[]): this {
    this.returningColumns = columns;

    return this;
  }

  getQueryAndParameters(): [string, unknown[]] {
    const { sql, parameters } = this.buildStatement();
    const compiled = compileNamedParameters(sql, parameters);

    return [compiled.text, compiled.values];
  }

  getQuery(): string {
    return this.buildStatement().sql;
  }

  async execute(): Promise<MutationResult> {
    const { sql, parameters } = this.buildStatement();
    const compiled = compileNamedParameters(sql, parameters);
    const rows = await this.context.executor.execute(compiled);

    const columnNameByResultAlias = buildColumnNameByResultAlias(
      this.alias,
      this.returningColumns,
    );
    const entities = rows.map((row) =>
      mapRowToEntity(row, columnNameByResultAlias),
    );

    return {
      generatedMaps: this.context.formatResult(entities),
    };
  }

  private buildStatement(): {
    sql: string;
    parameters: Record<string, unknown>;
  } {
    const parameters = { ...this.parameters };
    const setClauses = this.buildSetClauses(parameters);

    const sql = buildMutationStatement({
      alias: this.alias,
      tableShape: this.tableShape,
      kind: this.kind,
      setClauses,
      whereClauses: this.whereClauses,
      returningColumns: this.returningColumns,
    });

    return { sql, parameters };
  }

  private buildSetClauses(parameters: Record<string, unknown>): SetClause[] {
    if (this.kind === 'delete') {
      return [];
    }

    if (this.kind === 'soft-delete') {
      this.assertDeletedAtColumnExists();

      return this.withUpdatedAtMaintenance([
        {
          columnName: DELETED_AT_COLUMN_NAME,
          valueExpression: 'CURRENT_TIMESTAMP',
        },
      ]);
    }

    if (this.kind === 'restore') {
      this.assertDeletedAtColumnExists();

      return this.withUpdatedAtMaintenance([
        { columnName: DELETED_AT_COLUMN_NAME, valueExpression: 'NULL' },
      ]);
    }

    const setClauses: SetClause[] = [];

    for (const [columnName, value] of Object.entries(this.setRecord)) {
      this.assertColumnExists(columnName);

      if (typeof value === 'function') {
        throw new TwentyOrmException(
          `Function-valued updates are not supported on "${columnName}"`,
          TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
        );
      }

      let parameterName = `ormSet_${mutationSetParameterSequence++}`;

      while (parameterName in parameters) {
        parameterName = `ormSet_${mutationSetParameterSequence++}`;
      }

      parameters[parameterName] = serializeJsonbWriteValue(
        this.tableShape.columnShapeByColumnName[columnName],
        value,
      );
      setClauses.push({ columnName, valueExpression: `:${parameterName}` });
    }

    const callerSetUpdatedAt = Object.prototype.hasOwnProperty.call(
      this.setRecord,
      UPDATED_AT_COLUMN_NAME,
    );

    return callerSetUpdatedAt
      ? setClauses
      : this.withUpdatedAtMaintenance(setClauses);
  }

  private withUpdatedAtMaintenance(setClauses: SetClause[]): SetClause[] {
    if (
      !isDefined(
        this.tableShape.columnShapeByColumnName[UPDATED_AT_COLUMN_NAME],
      )
    ) {
      return setClauses;
    }

    return [
      ...setClauses,
      {
        columnName: UPDATED_AT_COLUMN_NAME,
        valueExpression: 'CURRENT_TIMESTAMP',
      },
    ];
  }

  private assertDeletedAtColumnExists(): void {
    if (!this.tableShape.hasDeletedAtColumn) {
      throw new TwentyOrmException(
        `"${this.tableShape.nameSingular}" has no "${DELETED_AT_COLUMN_NAME}" column, so it cannot be soft-deleted or restored`,
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }
  }

  private assertColumnExists(columnName: string): void {
    if (!isDefined(this.tableShape.columnShapeByColumnName[columnName])) {
      throw new TwentyOrmException(
        `Column "${columnName}" does not exist on "${this.tableShape.nameSingular}"`,
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
      );
    }
  }
}
