import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_PAYMENT_DATA_SEED_COLUMNS,
  MKT_PAYMENT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-payment-data-seeds.constants';

export const prefillMktPayments = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktPayment`, MKT_PAYMENT_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_PAYMENT_DATA_SEEDS)
    .execute();
};
