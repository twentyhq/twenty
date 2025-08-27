import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  MKT_DEPARTMENT_HIERARCHY_DATA_SEED_COLUMNS,
  MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-department-hierarchy-data-seeds.constants';

export const prefillMktDepartmentHierarchies = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const tableName = `${schemaName}."mktDepartmentHierarchy"`;

  // Check if department hierarchies already exist
  const existingHierarchies = await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .select('*')
    .from(tableName, 'hierarchy')
    .getRawMany();

  if (existingHierarchies.length === 0) {
    // Prepare data with date conversion for Date fields
    const seedData = MKT_DEPARTMENT_HIERARCHY_DATA_SEEDS.map((hierarchy) => ({
      ...hierarchy,
      // Convert Date objects to ISO strings if they exist
      validFrom: hierarchy.validFrom ? hierarchy.validFrom.toISOString() : null,
      validTo: hierarchy.validTo ? hierarchy.validTo.toISOString() : null,
      // Convert array to JSON string for hierarchyPath
      hierarchyPath: hierarchy.hierarchyPath
        ? JSON.stringify(hierarchy.hierarchyPath)
        : null,
    }));

    // Insert department hierarchies
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(tableName, MKT_DEPARTMENT_HIERARCHY_DATA_SEED_COLUMNS)
      .values(seedData)
      .execute();
  }
};
