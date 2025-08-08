import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_ORDER_DATA_SEED_COLUMNS,
  MKT_ORDER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-order-data-seeds.constants';

export const prefillMktOrders = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktOrder`, MKT_ORDER_DATA_SEED_COLUMNS)
    .values(MKT_ORDER_DATA_SEEDS)
    .execute();
};
