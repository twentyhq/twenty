import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_TAG_DATA_SEED_COLUMNS,
  MKT_TAG_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-tag-data-seeds.constants';

export const prefillMktTags = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktTag`, MKT_TAG_DATA_SEED_COLUMNS)
    .orIgnore()
    .values(MKT_TAG_DATA_SEEDS)
    .execute();
};
