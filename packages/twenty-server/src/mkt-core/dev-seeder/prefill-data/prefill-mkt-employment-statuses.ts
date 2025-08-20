import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_EMPLOYMENT_STATUS_DATA_SEED_COLUMNS,
  MKT_EMPLOYMENT_STATUS_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-employment-status-data-seeds.constants';

export const prefillMktEmploymentStatuses = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(
      `${schemaName}.mktEmploymentStatus`,
      MKT_EMPLOYMENT_STATUS_DATA_SEED_COLUMNS,
    )
    .values(MKT_EMPLOYMENT_STATUS_DATA_SEEDS)
    .execute();
};
