import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_TEMPLATE_DATA_SEED_COLUMNS,
  MKT_TEMPLATE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-template-data-seeds.constants';

export const prefillMktTemplates = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktTemplate`, MKT_TEMPLATE_DATA_SEED_COLUMNS)
    .values(MKT_TEMPLATE_DATA_SEEDS)
    .execute();
};
