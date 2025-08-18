import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_RESELLER_TIER_HISTORY_DATA_SEED_COLUMNS,
  MKT_RESELLER_TIER_HISTORY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-reseller-tier-history-data-seeds.constants';

export const prefillMktResellerTierHistories = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(
      `${schemaName}.mktResellerTierHistory`,
      MKT_RESELLER_TIER_HISTORY_DATA_SEED_COLUMNS,
    )
    .values(MKT_RESELLER_TIER_HISTORY_DATA_SEEDS)
    .execute();
};
