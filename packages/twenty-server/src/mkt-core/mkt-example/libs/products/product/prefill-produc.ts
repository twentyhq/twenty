import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { PRODUCT_DATA_SEED_COLUMNS, PRODUCT_DATA_SEEDS } from './seed/product.seed.constants';

const TABLE_NAME = 'mktProduct';

export const prefillProducts = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${TABLE_NAME}`, PRODUCT_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(PRODUCT_DATA_SEEDS)
    .execute();
};
