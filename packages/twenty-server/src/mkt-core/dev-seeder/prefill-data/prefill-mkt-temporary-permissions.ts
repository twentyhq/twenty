import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_TEMPORARY_PERMISSION_DATA_SEED_COLUMNS,
  MKT_TEMPORARY_PERMISSION_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-temporary-permission-data-seeds.constants';

export const prefillMktTemporaryPermissions = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktTemporaryPermission"`;

  // Check if temporary permissions already exist
  const existingPermissions = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'temp_perm')
    .getRawMany();

  if (existingPermissions.length === 0) {
    // Prepare data with proper date handling
    const seedData = MKT_TEMPORARY_PERMISSION_DATA_SEEDS.map((permission) => ({
      ...permission,
      // Convert ISO strings to Date objects for database insertion
      expiresAt: new Date(permission.expiresAt),
      revokedAt: permission.revokedAt ? new Date(permission.revokedAt) : null,
    }));

    // Insert temporary permissions
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_TEMPORARY_PERMISSION_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
