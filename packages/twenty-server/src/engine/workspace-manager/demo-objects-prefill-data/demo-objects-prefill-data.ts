import { DataSource, EntityManager } from 'typeorm';

import { seedWorkspaceFavorites } from 'src/database/typeorm-seeds/workspace/favorites';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { companyPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/company';
import { opportunityPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/opportunity';
import { personPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/person';
import { workspaceMemberPrefillData } from 'src/engine/workspace-manager/demo-objects-prefill-data/workspace-member';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';

export const demoObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
  isWorkflowEnabled: boolean,
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.standardId ?? ''] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.standardId ?? ''] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  await workspaceDataSource.transaction(
    async (entityManager: EntityManager) => {
      await companyPrefillDemoData(entityManager, schemaName);
      await personPrefillDemoData(entityManager, schemaName);
      await opportunityPrefillDemoData(entityManager, schemaName);

      const viewDefinitionsWithId = await viewPrefillData(
        entityManager,
        schemaName,
        objectMetadataMap,
        isWorkflowEnabled,
      );

      await seedWorkspaceFavorites(
        viewDefinitionsWithId
          .filter((view) => view.key === 'INDEX' && shouldSeedWorkspaceFavorite(view.objectMetadataId, objectMetadataMap))
          .map((view) => view.id),
        entityManager,
        schemaName,
      );
      await workspaceMemberPrefillData(entityManager, schemaName);
    },
  );
};
