import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';
import {
  quoteColumn,
  renderUserWhereExpression,
  type WhereClause,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type MutationKind = 'update' | 'delete' | 'soft-delete' | 'restore';

export type SetClause = {
  columnName: string;
  valueExpression: string;
};

export type MutationStatementState = {
  alias: string;
  tableShape: WorkspaceTableShape;
  kind: MutationKind;
  setClauses: SetClause[];
  whereClauses: WhereClause[];
  returningColumns: string[];
};

const buildReturningClause = (state: MutationStatementState): string => {
  if (state.returningColumns.length === 0) {
    return '';
  }

  const expressions = state.returningColumns.map(
    (columnName) =>
      `${quoteColumn(state.alias, columnName)} AS ${escapeIdentifier(
        buildColumnResultAlias(state.alias, columnName),
      )}`,
  );

  return `RETURNING ${expressions.join(', ')}`;
};

const buildTableReference = (state: MutationStatementState): string =>
  `${escapeIdentifier(state.tableShape.schemaName)}.${escapeIdentifier(
    state.tableShape.tableName,
  )} AS ${escapeIdentifier(state.alias)}`;

const buildSetClause = (state: MutationStatementState): string =>
  `SET ${state.setClauses
    .map(
      (setClause) =>
        `${escapeIdentifier(setClause.columnName)} = ${setClause.valueExpression}`,
    )
    .join(', ')}`;

export const buildMutationStatement = (
  state: MutationStatementState,
): string => {
  const whereExpression = renderUserWhereExpression(state.whereClauses);
  const returningClause = buildReturningClause(state);

  if (state.kind === 'delete') {
    return [
      `DELETE FROM ${buildTableReference(state)}`,
      whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
      returningClause,
    ]
      .filter((part) => part.length > 0)
      .join(' ');
  }

  if (state.setClauses.length === 0) {
    throw new TwentyOrmException(
      `An UPDATE on "${state.tableShape.nameSingular}" needs at least one column to set`,
      TwentyOrmExceptionCode.INVALID_QUERY,
    );
  }

  return [
    `UPDATE ${buildTableReference(state)}`,
    buildSetClause(state),
    whereExpression.length > 0 ? `WHERE ${whereExpression}` : '',
    returningClause,
  ]
    .filter((part) => part.length > 0)
    .join(' ');
};
