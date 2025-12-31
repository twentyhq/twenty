import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fromObjectMetadataEntityToFlatObjectMetadata = (
  objectMetadataEntity: ObjectMetadataEntity,
): FlatObjectMetadata => {
  const objectMetadataEntityWithoutRelations = removePropertiesFromRecord(
    objectMetadataEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.objectMetadata,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.objectMetadata)[],
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
