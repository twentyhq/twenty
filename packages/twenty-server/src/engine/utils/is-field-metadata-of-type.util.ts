import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export function isFieldMetadataOfType<T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface,
  type: T,
): fieldMetadata is Omit<FieldMetadataInterface, 'type'> & { type: T } {
  return fieldMetadata.type === type;
}
