import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

// Row-level permissions of the subquery's object are applied before it is embedded:
// a computed value only ever reflects records its reader could query directly
export const embedSubquery = async (
  queryBuilder: WorkspaceSelectQueryBuilder,
): Promise<string> => {
  await queryBuilder.applyRowLevelPermissions();

  Object.assign(
    queryBuilder.computedColumnSqlContext.parameters,
    queryBuilder.getParameters(),
  );

  return `(${queryBuilder.getQuery()})`;
};
