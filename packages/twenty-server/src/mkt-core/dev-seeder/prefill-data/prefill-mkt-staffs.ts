import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_STAFF_DATA_SEED_COLUMNS,
  MKT_STAFF_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-staff-data-seeds.constants';

export const prefillMktStaffs = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktStaff"`;

  // Check if staff already exist
  const existingStaff = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'staff')
    .getRawMany();

  if (existingStaff.length === 0) {
    // Prepare data - no JSON fields to stringify in staff
    const seedData = MKT_STAFF_DATA_SEEDS.map((staff) => ({
      ...staff,
      // Convert date strings to proper format if needed
      statusStartDate: staff.statusStartDate
        ? new Date(staff.statusStartDate).toISOString()
        : null,
      statusExpectedEndDate: staff.statusExpectedEndDate
        ? new Date(staff.statusExpectedEndDate).toISOString()
        : null,
    }));

    // Insert staff members
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_STAFF_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
