import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_KPI_DATA_SEED_COLUMNS,
  MKT_KPI_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-kpi-data-seeds.constants';

export const prefillMktKpis = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktKpi"`;

  // Check if KPIs already exist
  const existingKpis = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'kpi')
    .getRawMany();

  if (existingKpis.length === 0) {
    // Prepare data with proper handling of complex fields
    const seedData = MKT_KPI_DATA_SEEDS.map((kpi) => ({
      ...kpi,
      // Handle alertThresholds JSON field
      alertThresholds: kpi.alertThresholds
        ? JSON.stringify(kpi.alertThresholds)
        : null,
    }));

    // Insert KPIs
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_KPI_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
