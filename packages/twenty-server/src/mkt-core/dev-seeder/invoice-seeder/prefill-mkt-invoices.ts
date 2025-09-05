import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_INVOICE_DATA_SEED_COLUMNS,
  MKT_INVOICE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-invoice-data-seeds.constants';

export const prefillMktInvoices = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktInvoice`, MKT_INVOICE_DATA_SEED_COLUMNS)
    .values(MKT_INVOICE_DATA_SEEDS)
    .execute();
};
