import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_VALUE_DATA_SEED_COLUMNS,
  MKT_VALUE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/product-seeder/mkt-value-data-seeds.constants';

export const prefillMktValues = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktValue`, MKT_VALUE_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_VALUE_DATA_SEEDS)
    .execute();
};
