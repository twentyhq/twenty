import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type InsertRowValue =
  | { kind: 'parameter'; parameterName: string }
  | { kind: 'default' };

export type InsertStatementState = {
  tableShape: WorkspaceTableShape;
  columnNames: string[];
  rows: InsertRowValue[][];
  returningColumns: string[];
};

const buildReturningClause = (returningColumns: string[]): string => {
  if (returningColumns.length === 0) {
    return '';
  }

  const expressions = returningColumns.map((columnName) =>
    escapeIdentifier(columnName),
  );

  return `RETURNING ${expressions.join(', ')}`;
};

export const buildInsertStatement = (state: InsertStatementState): string => {
  if (state.columnNames.length === 0 || state.rows.length === 0) {
    throw new TwentyOrmException(
      `An INSERT on "${state.tableShape.nameSingular}" needs at least one column and one row`,
      TwentyOrmExceptionCode.INVALID_QUERY,
    );
  }

  const columnList = state.columnNames
    .map((columnName) => escapeIdentifier(columnName))
    .join(', ');

  const valuesList = state.rows
    .map(
      (row) =>
        `(${row
          .map((value) =>
            value.kind === 'default' ? 'DEFAULT' : `:${value.parameterName}`,
          )
          .join(', ')})`,
    )
    .join(', ');

  return [
    `INSERT INTO ${escapeIdentifier(state.tableShape.schemaName)}.${escapeIdentifier(
      state.tableShape.tableName,
    )} (${columnList})`,
    `VALUES ${valuesList}`,
    buildReturningClause(state.returningColumns),
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};
