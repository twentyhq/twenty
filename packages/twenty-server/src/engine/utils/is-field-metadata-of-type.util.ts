import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export function isFieldMetadataOfType<T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface<FieldMetadataType>,
  type: T,
): fieldMetadata is FieldMetadataInterface<T> {
  return fieldMetadata.type === type;
}
