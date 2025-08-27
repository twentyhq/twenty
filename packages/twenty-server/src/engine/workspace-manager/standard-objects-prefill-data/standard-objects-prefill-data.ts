import { type DataSource } from 'typeorm';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillCompanies } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import { prefillPeople } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';
import { prefillViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-views';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';

export const standardObjectsPrefillData = async (
  mainDataSource: DataSource,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
  featureFlags?: Record<string, boolean>,
) => {
  mainDataSource.transaction(async (entityManager: WorkspaceEntityManager) => {
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
