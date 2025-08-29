import { type EntityManager } from 'typeorm';
import { v4 } from 'uuid';

const tableName = 'favorite';

export const prefillWorkspaceFavorites = async (
  viewIds: string[],
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
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
