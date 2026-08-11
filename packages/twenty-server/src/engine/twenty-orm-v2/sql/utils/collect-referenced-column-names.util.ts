import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  type OrderByClause,
  type SelectClause,
} from 'src/engine/twenty-orm-v2/sql/utils/build-select-statement.util';

const QUALIFIED_COLUMN_REFERENCE = /"(\w+)"\."(\w+)"/g;

// The permission layer needs the columns a query reads, grouped by the alias they belong
// to: a joined alias is a different object with its own field permissions, and ordering
// by one of its columns reads it just as selecting it does.
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

    // Attributing a qualified column to the main alias would check the wrong object.
    if (qualifiedReferences.length > 0) {
      for (const [, alias, columnName] of qualifiedReferences) {
        addColumnName(alias, columnName);
      }

      continue;
    }

    for (const columnName of ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
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
