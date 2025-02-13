import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export function isFieldMetadataOfType<Type extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface<any>,
  type: Type,
): fieldMetadata is FieldMetadataInterface<Type> {
  return fieldMetadata.type === type;
}
