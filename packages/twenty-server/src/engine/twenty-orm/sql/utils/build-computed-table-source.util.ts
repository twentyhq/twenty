import { isDefined } from 'twenty-shared/utils';

import { type ComputedColumnSql } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A derived table keeping the table's alias exposes computed columns like stored ones; one reading another sits a level above
export const buildComputedTableSource = ({
  tableExpression,
  alias,
  computedColumnSqlByColumnName,
}: {
  tableExpression: string;
  alias: string;
  computedColumnSqlByColumnName: Record<string, ComputedColumnSql>;
}): string => {
  const columnNames = Object.keys(computedColumnSqlByColumnName);
  const quotedAlias = escapeIdentifier(alias);
  const levelByColumnName = new Map<string, number>();

  const computeLevel = (columnName: string, path: string[]): number => {
    const knownLevel = levelByColumnName.get(columnName);

    if (isDefined(knownLevel)) {
      return knownLevel;
    }

    if (path.includes(columnName)) {
      throw new TwentyOrmException(
        `Computed column "${columnName}" depends on itself`,
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    const level =
      1 +
      Math.max(
        0,
        ...computedColumnSqlByColumnName[
          columnName
        ].readComputedColumnNames.map((readColumnName) =>
          computeLevel(readColumnName, [...path, columnName]),
        ),
      );

    levelByColumnName.set(columnName, level);

    return level;
  };

  const highestLevel = Math.max(
    0,
    ...columnNames.map((columnName) => computeLevel(columnName, [])),
  );

  let tableSource = tableExpression;

  for (let level = 1; level <= highestLevel; level++) {
    const computedProjections = columnNames
      .filter((columnName) => levelByColumnName.get(columnName) === level)
      .map(
        (columnName) =>
          `(${computedColumnSqlByColumnName[columnName].sql}) AS ${escapeIdentifier(columnName)}`,
      );

    tableSource = `(SELECT ${quotedAlias}.*, ${computedProjections.join(', ')} FROM ${tableSource} AS ${quotedAlias})`;
  }

  return tableSource;
};
