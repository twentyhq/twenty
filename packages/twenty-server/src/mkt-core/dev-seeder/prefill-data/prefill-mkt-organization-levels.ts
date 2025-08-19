import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_ORGANIZATION_LEVEL_DATA_SEED_COLUMNS,
  MKT_ORGANIZATION_LEVEL_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-organization-level-data-seeds.constants';

export const prefillMktOrganizationLevels = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(
      `${schemaName}.mktOrganizationLevel`,
      MKT_ORGANIZATION_LEVEL_DATA_SEED_COLUMNS,
    )
    .values(MKT_ORGANIZATION_LEVEL_DATA_SEEDS)
    .execute();
};
