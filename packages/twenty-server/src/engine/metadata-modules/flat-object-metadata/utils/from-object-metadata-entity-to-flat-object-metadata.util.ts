import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
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
    universalIdentifier:
      objectMetadataEntityWithoutRelations.standardId ??
      objectMetadataEntityWithoutRelations.id,
    flatFieldMetadatas: objectMetadataEntity.fields.map(
      fromFieldMetadataEntityToFlatFieldMetadata,
    ),
  };
};
