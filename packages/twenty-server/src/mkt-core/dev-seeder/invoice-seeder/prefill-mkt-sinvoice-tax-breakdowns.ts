import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_SINVOICE_TAX_BREAKDOWN_DATA_SEED_COLUMNS,
  MKT_SINVOICE_TAX_BREAKDOWN_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-tax-breakdown-data-seeds.constants';

export const prefillMktSInvoiceTaxBreakdowns = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktSInvoiceTaxBreakdown`, MKT_SINVOICE_TAX_BREAKDOWN_DATA_SEED_COLUMNS)
    .values(MKT_SINVOICE_TAX_BREAKDOWN_DATA_SEEDS)
    .execute();
};
