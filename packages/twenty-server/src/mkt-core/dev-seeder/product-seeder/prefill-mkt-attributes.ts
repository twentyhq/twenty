import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_ATTRIBUTE_DATA_SEED_COLUMNS,
  MKT_ATTRIBUTE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/product-seeder/mkt-attribute-data-seeds.constants';

export const prefillMktAttributes = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktAttribute`, MKT_ATTRIBUTE_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_ATTRIBUTE_DATA_SEEDS)
    .execute();
};
