import { type DataSource, type EntityManager } from 'typeorm';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillCompanies } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import { prefillPeople } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';
import { prefillViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-views';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';

export const standardObjectsPrefillData = async (
  dataSource: DataSource,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
  featureFlags?: Record<string, boolean>,
) => {
  dataSource.transaction(async (entityManager: EntityManager) => {
    await prefillCompanies(entityManager, schemaName);

    await prefillPeople(entityManager, schemaName);

    await prefillWorkflows(entityManager, schemaName, objectMetadataItems);

    const viewDefinitionsWithId = await prefillViews(
      entityManager,
      schemaName,
      objectMetadataItems,
      featureFlags,
    );

    await prefillWorkspaceFavorites(
      viewDefinitionsWithId
        .filter(
          (view) =>
            view.key === 'INDEX' &&
            shouldSeedWorkspaceFavorite(
              view.objectMetadataId,
              objectMetadataItems,
            ),
        )
        .map((view) => view.id),
      entityManager,
      schemaName,
    );
  });
};
