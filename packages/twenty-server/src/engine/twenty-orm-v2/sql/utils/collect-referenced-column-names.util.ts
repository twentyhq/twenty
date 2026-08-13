import {
  type OrderByClause,
  type SelectClause,
} from 'src/engine/twenty-orm-v2/sql/utils/build-select-statement.util';
import { extractColumnNamesFromAggregateExpression } from 'src/utils/extract-column-names-from-aggregate-expression.util';

const QUALIFIED_COLUMN_REFERENCE = /"(\w+)"\."(\w+)"/g;

export const collectReferencedColumnNames = ({
  mainAlias,
  mainAliasColumnNames,
  extraSelectClauses,
  orderByClauses,
}: {
  mainAlias: string;
  mainAliasColumnNames: string[];
  extraSelectClauses: SelectClause[];
  orderByClauses: OrderByClause[];
}): Record<string, string[]> => {
  const columnNamesByAlias: Record<string, Set<string>> = {
    [mainAlias]: new Set(mainAliasColumnNames),
  };

  const addColumnName = (alias: string, columnName: string) => {
    columnNamesByAlias[alias] = (
      columnNamesByAlias[alias] ?? new Set<string>()
    ).add(columnName);
  };

  const expressions = [
    ...extraSelectClauses.map((extraSelect) => extraSelect.expression),
    ...orderByClauses.map((orderByClause) => orderByClause.expression),
  ];

  for (const expression of expressions) {
    const qualifiedReferences = [
      ...expression.matchAll(QUALIFIED_COLUMN_REFERENCE),
    ];

    if (qualifiedReferences.length > 0) {
      for (const [, alias, columnName] of qualifiedReferences) {
        addColumnName(alias, columnName);
      }

      continue;
    }

    for (const columnName of extractColumnNamesFromAggregateExpression(
      expression,
    ) ?? []) {
      addColumnName(mainAlias, columnName);
    }
  }

  return Object.fromEntries(
    Object.entries(columnNamesByAlias).map(([alias, columnNames]) => [
      alias,
      [...columnNames],
    ]),
  );
};
