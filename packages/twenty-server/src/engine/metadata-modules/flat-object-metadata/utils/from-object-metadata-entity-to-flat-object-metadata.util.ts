import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fromObjectMetadataEntityToFlatObjectMetadata = (
  objectMetadataEntity: ObjectMetadataEntity,
): FlatObjectMetadata => {
  const objectMetadataEntityWithoutRelations = removePropertiesFromRecord(
    objectMetadataEntity,
    getMetadataEntityRelationProperties('objectMetadata'),
  );

  return {
    ...objectMetadataEntityWithoutRelations,
    createdAt: objectMetadataEntity.createdAt.toISOString(),
    updatedAt: objectMetadataEntity.updatedAt.toISOString(),
    viewIds: objectMetadataEntity.views.map((viewEntity) => viewEntity.id),
    indexMetadataIds: objectMetadataEntity.indexMetadatas.map(
      (indexEntity) => indexEntity.id,
    ),
    fieldMetadataIds: objectMetadataEntity.fields.map(
      (fieldEntity) => fieldEntity.id,
    ),
    universalIdentifier:
      objectMetadataEntityWithoutRelations.standardId ??
      objectMetadataEntityWithoutRelations.id,
  };
};
