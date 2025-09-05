import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_SINVOICE_AUTH_DATA_SEED_COLUMNS,
  MKT_SINVOICE_AUTH_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-auth-data-seeds.constants';

export const prefillMktSInvoiceAuths = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktSInvoiceAuth`, MKT_SINVOICE_AUTH_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_SINVOICE_AUTH_DATA_SEEDS)
    .execute();
};
