import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export const isUUIDFieldMetadata = (
  fieldMetadata: FieldMetadataInterface<any>,
): fieldMetadata is FieldMetadataInterface<FieldMetadataType.UUID> => {
  return fieldMetadata.type === FieldMetadataType.UUID;
};
