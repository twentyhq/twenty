import { isDefined } from 'twenty-shared/utils';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A computed column is exposed as a column of a derived table that keeps the table's alias,
// so SELECT, WHERE, ORDER BY and GROUP BY reference it like a stored column.
// A computed column reading another one sits one level above it.
export const buildComputedTableSource = ({
  tableExpression,
  alias,
  computedColumnSqlByColumnName,
}: {
  tableExpression: string;
  alias: string;
  computedColumnSqlByColumnName: Record<string, string>;
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
        ...columnNames
          .filter(
            (otherColumnName) =>
              otherColumnName !== columnName &&
              computedColumnSqlByColumnName[columnName].includes(
                `${quotedAlias}.${escapeIdentifier(otherColumnName)}`,
              ),
          )
          .map((dependencyColumnName) =>
            computeLevel(dependencyColumnName, [...path, columnName]),
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
          `(${computedColumnSqlByColumnName[columnName]}) AS ${escapeIdentifier(columnName)}`,
      );

    tableSource = `(SELECT ${quotedAlias}.*, ${computedProjections.join(', ')} FROM ${tableSource} AS ${quotedAlias})`;
  }

  return tableSource;
};
