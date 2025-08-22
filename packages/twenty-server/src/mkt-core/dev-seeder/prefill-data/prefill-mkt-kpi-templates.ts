import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_KPI_TEMPLATE_DATA_SEED_COLUMNS,
  MKT_KPI_TEMPLATE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-kpi-template-data-seeds.constants';

export const prefillMktKpiTemplates = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktKpiTemplate"`;

  // Check if KPI templates already exist
  const existingKpiTemplates = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'kpiTemplate')
    .getRawMany();

  if (existingKpiTemplates.length === 0) {
    // Prepare data with proper handling of complex fields
    const seedData = MKT_KPI_TEMPLATE_DATA_SEEDS.map((template) => ({
      ...template,
      // Handle templateConfig JSON field
      templateConfig: template.templateConfig
        ? JSON.stringify(template.templateConfig)
        : null,
    }));

    // Insert KPI templates
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_KPI_TEMPLATE_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
