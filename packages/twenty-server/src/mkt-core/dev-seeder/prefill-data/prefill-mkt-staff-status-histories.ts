import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_STAFF_STATUS_HISTORY_DATA_SEED_COLUMNS,
  MKT_STAFF_STATUS_HISTORY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-staff-status-history-data-seeds.constants';

export const prefillMktStaffStatusHistories = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktStaffStatusHistory"`;

  // Check if staff status histories already exist
  const existingHistories = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'history')
    .getRawMany();

  if (existingHistories.length === 0) {
    // Prepare data - convert date strings to proper format
    const seedData = MKT_STAFF_STATUS_HISTORY_DATA_SEEDS.map((history) => ({
      ...history,
      // Convert date strings to proper format
      changeDate: new Date(history.changeDate).toISOString(),
      expectedEndDate: history.expectedEndDate
        ? new Date(history.expectedEndDate).toISOString()
        : null,
      actualEndDate: history.actualEndDate
        ? new Date(history.actualEndDate).toISOString()
        : null,
    }));

    // Insert staff status history records
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_STAFF_STATUS_HISTORY_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
