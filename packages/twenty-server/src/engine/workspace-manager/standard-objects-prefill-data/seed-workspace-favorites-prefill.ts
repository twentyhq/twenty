import { v4 } from 'uuid';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'favorite';

export const seedWorkspaceFavorites = async (
  viewIds: string[],
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'viewId', 'position'])
    .values(
      viewIds.map((viewId, index) => ({
        id: v4(),
        viewId,
        position: index,
      })),
    )
    .execute();
};
