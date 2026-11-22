import { type UnreadableColumnConditions } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { escapeRegularExpression } from 'src/engine/twenty-orm/sql/utils/escape-regular-expression.util';
import { renderUnreadableColumn } from 'src/engine/twenty-orm/sql/utils/render-unreadable-column.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type UnreadableColumnReplacements = {
  replacementByQuotedColumn: Map<string, string>;
  quotedColumnPattern: RegExp;
};

export const buildUnreadableColumnReplacements = (
  unreadableColumnConditions: UnreadableColumnConditions,
): UnreadableColumnReplacements | undefined => {
  const replacementByQuotedColumn = new Map(
    Object.entries(unreadableColumnConditions).flatMap(([alias, conditions]) =>
      Object.entries(conditions).map(
        ([columnName, unreadableConditions]): [string, string] => {
          const quotedColumn = `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

          return [
            quotedColumn,
            `(${renderUnreadableColumn({ quotedColumn, unreadableConditions })})`,
          ];
        },
      ),
    ),
  );

  if (replacementByQuotedColumn.size === 0) {
    return undefined;
  }

  return {
    replacementByQuotedColumn,
    quotedColumnPattern: new RegExp(
      [...replacementByQuotedColumn.keys()]
        .map(escapeRegularExpression)
        .join('|'),
      'g',
    ),
  };
};
