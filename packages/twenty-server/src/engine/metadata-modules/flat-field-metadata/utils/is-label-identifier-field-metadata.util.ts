import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isLabelIdentifierFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
  objectMetadata: FlatObjectMetadata,
): boolean => {
  return objectMetadata.labelIdentifierFieldMetadataId === flatFieldMetadata.id;
};
