import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';
import { namespaceSqlParameters } from 'src/engine/twenty-orm/computed-column/utils/namespace-sql-parameters.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

// Row-level permissions of the subquery's object are applied before it is embedded:
// a computed value only ever reflects records its reader could query directly
export const embedSubquery = async (
  queryBuilder: WorkspaceSelectQueryBuilder,
): Promise<SqlWithParameters> => {
  await queryBuilder.applyRowLevelPermissions();

  return namespaceSqlParameters({
    sql: `(${queryBuilder.getQuery()})`,
    parameters: queryBuilder.getParameters(),
    namespace: queryBuilder.alias,
  });
};
