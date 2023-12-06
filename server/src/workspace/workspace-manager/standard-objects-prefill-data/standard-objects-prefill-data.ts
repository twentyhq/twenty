import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { viewPrefillData } from 'src/workspace/workspace-manager/standard-objects-prefill-data/view';
import { companyPrefillData } from 'src/workspace/workspace-manager/standard-objects-prefill-data/company';
import { personPrefillData } from 'src/workspace/workspace-manager/standard-objects-prefill-data/person';
import { pipelineStepPrefillData } from 'src/workspace/workspace-manager/standard-objects-prefill-data/pipeline-step';

export const standardObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.nameSingular] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.name] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  workspaceDataSource.transaction(async (entityManager: EntityManager) => {
    await companyPrefillData(entityManager, schemaName);
    await personPrefillData(entityManager, schemaName);
    await viewPrefillData(entityManager, schemaName, objectMetadataMap);
    await pipelineStepPrefillData(entityManager, schemaName);
  });
};
