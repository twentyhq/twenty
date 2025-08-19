import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_DEPARTMENT_DATA_SEED_COLUMNS,
  MKT_DEPARTMENT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-department-data-seeds.constants';

export const prefillMktDepartments = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktDepartment"`;

  // Check if departments already exist
  const existingDepartments = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'dept')
    .getRawMany();

  if (existingDepartments.length === 0) {
    console.log(
      `🌱 Seeding ${MKT_DEPARTMENT_DATA_SEEDS.length} departments into ${tableName}`,
    );

    // Prepare data with JSON stringification for complex fields
    const seedData = MKT_DEPARTMENT_DATA_SEEDS.map((department) => ({
      ...department,
      // No JSON fields in department entity, all are primitive types
    }));

    // Insert departments
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_DEPARTMENT_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();

    console.log(
      `✅ Successfully seeded ${MKT_DEPARTMENT_DATA_SEEDS.length} departments`,
    );
  } else {
    console.log(
      `ℹ️ Departments already exist in ${tableName}, skipping seeding`,
    );
  }
};
