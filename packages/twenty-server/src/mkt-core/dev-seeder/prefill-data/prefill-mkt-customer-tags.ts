import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_CUSTOMER_TAG_DATA_SEED_COLUMNS,
  MKT_CUSTOMER_TAG_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-customer-tag-data-seeds.constants';

export const prefillMktCustomerTags = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktCustomerTag`, MKT_CUSTOMER_TAG_DATA_SEED_COLUMNS)
    .values(MKT_CUSTOMER_TAG_DATA_SEEDS)
    .execute();
};
