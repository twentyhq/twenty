import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_CONTRACT_DATA_SEED_COLUMNS,
  MKT_CONTRACT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-contract-data-seeds.constants';

export const prefillMktContracts = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktContract`, MKT_CONTRACT_DATA_SEED_COLUMNS)
    .values(MKT_CONTRACT_DATA_SEEDS)
    .execute();
};
