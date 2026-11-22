import { SQL_STRING_LITERAL_PATTERN } from 'src/engine/twenty-orm/sql/constants/sql-string-literal-pattern.constant';
import { type UnreadableColumnConditions } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const findUnreadableColumnConditions = ({
  expressions,
  unreadableColumnConditions,
  aliases,
}: {
  expressions: string[];
  unreadableColumnConditions: UnreadableColumnConditions;
  aliases: string[];
}): string[] => {
  const unreadableColumns = aliases.flatMap((alias) =>
    Object.entries(unreadableColumnConditions[alias] ?? {}).map(
      ([columnName, unreadableConditions]) => ({
        quotedColumn: `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`,
        unreadableConditions,
      }),
    ),
  );

  return [
    ...new Set(
      expressions.flatMap((expression) => {
        const expressionOutsideLiterals = expression
          .split(SQL_STRING_LITERAL_PATTERN)
          .filter((_, segmentIndex) => segmentIndex % 2 === 0)
          .join(' ');

        return unreadableColumns.flatMap(
          ({ quotedColumn, unreadableConditions }) =>
            expressionOutsideLiterals.includes(quotedColumn)
              ? unreadableConditions
              : [],
        );
      }),
    ),
  ];
};
