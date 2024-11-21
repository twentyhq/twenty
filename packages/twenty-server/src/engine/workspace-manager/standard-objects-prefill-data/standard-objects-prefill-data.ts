import { DataSource, EntityManager } from 'typeorm';

import { seedWorkspaceFavorites } from 'src/database/typeorm-seeds/workspace/favorites';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { companyPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/company';
import { personPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/person';
import { seedViewWithDemoData } from 'src/engine/workspace-manager/standard-objects-prefill-data/seed-view-with-demo-data';

export const standardObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
  isWorkflowEnabled: boolean,
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    if (!object.standardId) {
      throw new Error('Standard Id is not set for object: ${object.name}');
    }

    acc[object.standardId] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        if (!field.standardId) {
          throw new Error('Standard Id is not set for field: ${field.name}');
        }

        acc[field.standardId] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  workspaceDataSource.transaction(async (entityManager: EntityManager) => {
    await companyPrefillData(entityManager, schemaName);
    await personPrefillData(entityManager, schemaName);
    const viewDefinitionsWithId = await seedViewWithDemoData(
      entityManager,
      schemaName,
      objectMetadataMap,
      isWorkflowEnabled,
    );

    await seedWorkspaceFavorites(
      viewDefinitionsWithId
        .filter(
          (view) =>
            view.key === 'INDEX' &&
            shouldSeedWorkspaceFavorite(
              view.objectMetadataId,
              objectMetadataMap,
            ),
        )
        .map((view) => view.id),
      entityManager,
      schemaName,
    );
  });
};
