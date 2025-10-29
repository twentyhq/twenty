import { type DataSource, type EntityManager } from 'typeorm';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { prefillCompanies } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import { prefillPeople } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';

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
  });
};
