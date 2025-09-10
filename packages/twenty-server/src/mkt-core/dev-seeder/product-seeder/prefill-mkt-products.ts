import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_PRODUCT_DATA_SEED_COLUMNS,
  MKT_PRODUCT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/product-seeder/mkt-product-data-seeds.constants';

export const prefillMktProducts = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktProduct`, MKT_PRODUCT_DATA_SEED_COLUMNS)
    .values(MKT_PRODUCT_DATA_SEEDS)
    .execute();
};
