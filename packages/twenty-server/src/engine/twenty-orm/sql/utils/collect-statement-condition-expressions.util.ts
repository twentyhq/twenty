import { isDefined } from 'twenty-shared/utils';

import {
  collectStatementAliases,
  quoteQualifiedAliasReferences,
  type SelectStatementState,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';

// Every clause that filters, joins, groups or hides rows and columns, as the statement will render it
export const collectStatementConditionExpressions = (
  state: SelectStatementState,
): string[] => {
  const aliases = collectStatementAliases(state);

  return [
    ...[
      ...state.whereClauses.map(({ sql }) => sql),
      ...state.rowAccessConditions,
    ].map((expression) => quoteQualifiedAliasReferences(expression, aliases)),
    ...state.groupByExpressions,
    ...state.joinClauses.flatMap((joinClause) =>
      [
        joinClause.condition,
        joinClause.toManyPlainCondition,
        ...joinClause.additionalOnConditions,
      ].filter(isDefined),
    ),
    ...state.existsFilterClauses.flatMap((existsFilterClause) => [
      existsFilterClause.correlationCondition,
      existsFilterClause.conditionSql,
      ...existsFilterClause.additionalOnConditions,
    ]),
    ...Object.values(state.columnNullifyConditions).flatMap(
      (nullifyConditionsByColumnName) =>
        Object.values(nullifyConditionsByColumnName).flat(),
    ),
  ];
};
