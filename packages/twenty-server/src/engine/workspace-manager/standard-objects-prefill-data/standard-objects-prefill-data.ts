import { DataSource } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillCompanies } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import { prefillPeople } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';
import { prefillViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-views';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';

export const standardObjectsPrefillData = async (
  mainDataSource: DataSource,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  mainDataSource.transaction(async (entityManager: WorkspaceEntityManager) => {
    await prefillCompanies(entityManager, schemaName);

    await prefillPeople(entityManager, schemaName);

    await prefillWorkflows(entityManager, schemaName);

    const viewDefinitionsWithId = await prefillViews(
      entityManager,
      schemaName,
      objectMetadataItems,
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
