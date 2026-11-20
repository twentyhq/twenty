import { type ColumnNullifyConditions } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { escapeRegularExpression } from 'src/engine/twenty-orm/sql/utils/escape-regular-expression.util';
import { renderNullifiedColumn } from 'src/engine/twenty-orm/sql/utils/render-nullified-column.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type ColumnMasks = {
  maskedColumnByQuotedColumn: Map<string, string>;
  quotedColumnPattern: RegExp;
};

export const buildColumnMasks = (
  columnNullifyConditions: ColumnNullifyConditions,
): ColumnMasks | undefined => {
  const maskedColumnByQuotedColumn = new Map(
    Object.entries(columnNullifyConditions).flatMap(([alias, conditions]) =>
      Object.entries(conditions).map(
        ([columnName, nullifyConditions]): [string, string] => {
          const quotedColumn = `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

          return [
            quotedColumn,
            `(${renderNullifiedColumn({ quotedColumn, nullifyConditions })})`,
          ];
        },
      ),
    ),
  );

  if (maskedColumnByQuotedColumn.size === 0) {
    return undefined;
  }

  return {
    maskedColumnByQuotedColumn,
    quotedColumnPattern: new RegExp(
      [...maskedColumnByQuotedColumn.keys()]
        .map(escapeRegularExpression)
        .join('|'),
      'g',
    ),
  };
};
