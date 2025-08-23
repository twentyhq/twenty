import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_CUSTOMER_DATA_SEED_COLUMNS,
  MKT_CUSTOMER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-customer-data-seeds.constants';

export const prefillMktCustomers = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktCustomer`, MKT_CUSTOMER_DATA_SEED_COLUMNS)
    .values(MKT_CUSTOMER_DATA_SEEDS)
    .execute();
};
