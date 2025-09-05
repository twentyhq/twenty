import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_SINVOICE_PAYMENT_DATA_SEED_COLUMNS,
  MKT_SINVOICE_PAYMENT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-payment-data-seeds.constants';

export const prefillMktSInvoicePayments = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktSInvoicePayment`, MKT_SINVOICE_PAYMENT_DATA_SEED_COLUMNS)
    .values(MKT_SINVOICE_PAYMENT_DATA_SEEDS)
    .execute();
};
