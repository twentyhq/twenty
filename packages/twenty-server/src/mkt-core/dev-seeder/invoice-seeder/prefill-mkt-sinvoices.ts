import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_SINVOICE_DATA_SEED_COLUMNS,
  MKT_SINVOICE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-data-seeds.constants';

export const prefillMktSInvoices = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktSInvoice`, MKT_SINVOICE_DATA_SEED_COLUMNS)
    .values(MKT_SINVOICE_DATA_SEEDS)
    .execute();
};
