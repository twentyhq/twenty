import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_COMBO_DATA_SEED_COLUMNS,
  MKT_COMBO_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/product-seeder/mkt-combo-data-seeds.constants';

export const prefillMktCombos = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktCombo`, MKT_COMBO_DATA_SEED_COLUMNS)
    .values(MKT_COMBO_DATA_SEEDS)
    .execute();
};
