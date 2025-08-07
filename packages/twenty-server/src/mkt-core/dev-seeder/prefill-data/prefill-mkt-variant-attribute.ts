import {WorkspaceEntityManager} from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS,MKT_VARIANT_ATTRIBUTE_DATA_SEEDS} from 'src/mkt-core/dev-seeder/constants/mkt-variant-attribute-data-seeds.constants';

export const prefillMktVariantAttributes = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktVariantAttribute`, MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_VARIANT_ATTRIBUTE_DATA_SEEDS)
    .execute();
};
