import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_SINVOICE_METADATA_DATA_SEED_COLUMNS,
  MKT_SINVOICE_METADATA_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-metadata-data-seeds.constants';

export const prefillMktSInvoiceMetadata = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(
      `${schemaName}.mktSInvoiceMetadata`,
      MKT_SINVOICE_METADATA_DATA_SEED_COLUMNS,
    )
    .values(MKT_SINVOICE_METADATA_DATA_SEEDS)
    .execute();
};
