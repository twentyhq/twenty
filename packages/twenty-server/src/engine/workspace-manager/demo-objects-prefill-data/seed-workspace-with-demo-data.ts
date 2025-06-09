import { DataSource } from 'typeorm';

import { seedWorkspaceFavorites } from 'src/database/typeorm-seeds/workspace/favorites';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { seedCarrierWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-carrier-with-demo-data';
import { seedCompanyWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-company-with-demo-data';
import { seedOpportunityWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-opportunity-with-demo-data';
import { seedPersonWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-person-with-demo-data';
import { seedWorkspaceMemberWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-workspace-member-with-demo-data';
import { seedViewWithDemoData } from 'src/engine/workspace-manager/standard-objects-prefill-data/seed-view-with-demo-data';

interface ObjectMetadataMap {
  [key: string]: {
    id: string;
    fields: {
      [key: string]: string;
    };
  };
}

export const seedWorkspaceWithDemoData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
) => {
  const objectMetadataMap: ObjectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.standardId ?? ''] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.standardId ?? ''] = field.id;
        return acc;
      }, {} as { [key: string]: string }),
    };
    return acc;
  }, {} as ObjectMetadataMap);

  await workspaceDataSource.transaction(
    async (entityManager: WorkspaceEntityManager) => {
      // Only seed carrier records and view, assuming object metadata exists
      await seedCarrierWithDemoData(entityManager, schemaName, objectMetadataMap);
      await seedCompanyWithDemoData(entityManager, schemaName);
      await seedPersonWithDemoData(entityManager, schemaName);
      await seedOpportunityWithDemoData(entityManager, schemaName);

      const viewDefinitionsWithId = await seedViewWithDemoData(
        entityManager,
        schemaName,
        objectMetadataMap,
      );

      await seedWorkspaceFavorites(
        viewDefinitionsWithId
          .filter((view) => view.key === 'INDEX' && shouldSeedWorkspaceFavorite(view.objectMetadataId, objectMetadataMap))
          .map((view) => view.id),
        entityManager,
        schemaName,
      );
      await seedWorkspaceMemberWithDemoData(entityManager, schemaName);
    },
  );
};
