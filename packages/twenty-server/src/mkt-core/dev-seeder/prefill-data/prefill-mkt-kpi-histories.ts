import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_KPI_HISTORY_DATA_SEED_COLUMNS,
  MKT_KPI_HISTORY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-kpi-history-data-seeds.constants';

export const prefillMktKpiHistories = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktKpiHistory"`;

  // Check if KPI Histories already exist
  const existingKpiHistories = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'kpiHistory')
    .getRawMany();

  if (existingKpiHistories.length === 0) {
    // Prepare data with proper handling of complex fields
    const seedData = MKT_KPI_HISTORY_DATA_SEEDS.map((kpiHistory) => ({
      ...kpiHistory,
      // Handle JSON fields
      oldValue: kpiHistory.oldValue
        ? JSON.stringify(kpiHistory.oldValue)
        : null,
      newValue: kpiHistory.newValue
        ? JSON.stringify(kpiHistory.newValue)
        : null,
      additionalData: kpiHistory.additionalData
        ? JSON.stringify(kpiHistory.additionalData)
        : null,
      // Convert timestamp to proper format
      changeTimestamp: new Date(kpiHistory.changeTimestamp).toISOString(),
    }));

    // Insert KPI History records
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_KPI_HISTORY_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
