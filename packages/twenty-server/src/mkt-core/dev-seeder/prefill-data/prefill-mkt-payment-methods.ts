import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_PAYMENT_METHOD_DATA_SEED_COLUMNS,
  MKT_PAYMENT_METHOD_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-payment-method-data-seeds.constants';

export const prefillMktPaymentMethods = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(
      `${schemaName}.mktPaymentMethod`,
      MKT_PAYMENT_METHOD_DATA_SEED_COLUMNS,
    )
    .orIgnore()
    .values(MKT_PAYMENT_METHOD_DATA_SEEDS)
    .execute();
};
