import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_DATA_ACCESS_POLICY_DATA_SEED_COLUMNS,
  MKT_DATA_ACCESS_POLICY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-data-access-policy-data-seeds.constants';

export const prefillMktDataAccessPolicies = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktDataAccessPolicy"`;

  // Check if data access policies already exist
  const existingPolicies = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'policy')
    .getRawMany();

  if (existingPolicies.length === 0) {
    // Prepare data with JSON serialization for filterConditions
    const seedData = MKT_DATA_ACCESS_POLICY_DATA_SEEDS.map((policy) => ({
      ...policy,
      // Convert filterConditions object to JSON string for database storage
      filterConditions: JSON.stringify(policy.filterConditions),
    }));

    // Insert data access policies
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_DATA_ACCESS_POLICY_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
