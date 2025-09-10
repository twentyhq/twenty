import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_COMBO_VARIANT_DATA_SEED_COLUMNS,
  MKT_COMBO_VARIANT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/product-seeder/mkt-combo-variant-data-seeds.constants';

export const prefillMktComboVariants = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktComboVariant`, MKT_COMBO_VARIANT_DATA_SEED_COLUMNS)
    .values(MKT_COMBO_VARIANT_DATA_SEEDS)
    .execute();
};
