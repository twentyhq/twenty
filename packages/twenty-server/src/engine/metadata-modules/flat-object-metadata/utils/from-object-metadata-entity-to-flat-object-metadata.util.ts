import { removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  type FlatObjectMetadata,
  objectMetadataEntityRelationProperties,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fromObjectMetadataEntityToFlatObjectMetadata = (
  objectMetadataEntity: ObjectMetadataEntity,
): FlatObjectMetadata => {
  const objectMetadataEntityWithoutRelations = removePropertiesFromRecord(
    objectMetadataEntity,
    objectMetadataEntityRelationProperties,
  );

  return {
    ...objectMetadataEntityWithoutRelations,
    indexMetadatasIds: objectMetadataEntity.indexMetadatas.map(
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
