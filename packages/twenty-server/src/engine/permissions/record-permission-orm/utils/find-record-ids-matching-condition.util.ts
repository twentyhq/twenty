/* @license Enterprise */

import { isObject } from '@sniptt/guards';

import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const findRecordIdsMatchingCondition = async ({
  executor,
  tableExpression,
  tableAlias,
  recordIds,
  condition,
}: {
  executor: QueryExecutor;
  tableExpression: string;
  tableAlias: string;
  recordIds: string[];
  condition: SqlCondition | true;
}): Promise<Set<string>> => {
  const escapedTableAlias = escapeIdentifier(tableAlias);
  const conditionClause = isObject(condition) ? ` AND (${condition.sql})` : '';

  const rows = await executor.execute(
    compileNamedParameters(
      `SELECT ${escapedTableAlias}."id" FROM ${tableExpression} AS ${escapedTableAlias} WHERE ${escapedTableAlias}."id" = ANY(:candidateRecordIds)${conditionClause}`,
      {
        ...(isObject(condition) ? condition.parameters : {}),
        candidateRecordIds: recordIds,
      },
    ),
  );

  return new Set(rows.map(({ id }) => String(id)));
};
