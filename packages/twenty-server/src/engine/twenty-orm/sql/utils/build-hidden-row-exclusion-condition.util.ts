import { SQL_STRING_LITERALS } from 'src/engine/twenty-orm/sql/constants/sql-string-literals.constant';
import { type ColumnNullifyConditions } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const findReferencedColumnNullifyConditions = ({
  expression,
  columnNullifyConditions,
  aliases,
}: {
  expression: string;
  columnNullifyConditions: ColumnNullifyConditions;
  aliases: string[];
}): string[] => {
  const expressionOutsideLiterals = expression
    .split(SQL_STRING_LITERALS)
    .filter((_, segmentIndex) => segmentIndex % 2 === 0)
    .join(' ');

  return aliases.flatMap((alias) =>
    Object.entries(columnNullifyConditions[alias] ?? {}).flatMap(
      ([columnName, nullifyConditions]) =>
        expressionOutsideLiterals.includes(
          `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`,
        )
          ? nullifyConditions
          : [],
    ),
  );
};

export const buildHiddenRowExclusionCondition = ({
  expressions,
  columnNullifyConditions,
  aliases,
}: {
  expressions: string[];
  columnNullifyConditions: ColumnNullifyConditions;
  aliases: string[];
}): string | undefined => {
  const excludedConditions = new Set(
    expressions.flatMap((expression) =>
      findReferencedColumnNullifyConditions({
        expression,
        columnNullifyConditions,
        aliases,
      }),
    ),
  );

  return excludedConditions.size > 0
    ? `NOT COALESCE(${[...excludedConditions]
        .map((excludedCondition) => `(${excludedCondition})`)
        .join(' OR ')}, FALSE)`
    : undefined;
};
