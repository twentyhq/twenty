import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';
import { companyPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/company';
import { personPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/person';

export const standardObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
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
    await viewPrefillData(entityManager, schemaName, objectMetadataMap);
  });
};
