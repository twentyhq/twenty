import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_RESELLER_DATA_SEED_COLUMNS,
  MKT_RESELLER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-reseller-data-seeds.constants';

export const prefillMktResellers = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktReseller`, MKT_RESELLER_DATA_SEED_COLUMNS)
    .values(MKT_RESELLER_DATA_SEEDS)
    .execute();
};
