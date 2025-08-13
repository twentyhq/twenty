import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_LICENSE_DATA_SEED_COLUMNS,
  MKT_LICENSE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-license-data-seeds.constants';

export const prefillMktLicenses = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktLicense`, MKT_LICENSE_DATA_SEED_COLUMNS)
    .values(MKT_LICENSE_DATA_SEEDS)
    .execute();
};
