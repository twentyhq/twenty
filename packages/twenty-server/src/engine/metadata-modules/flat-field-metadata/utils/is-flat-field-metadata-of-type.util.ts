import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export function isFlatFieldMetadataOfType<
  Field extends FlatFieldMetadataSecond<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FlatFieldMetadataSecond<Type> {
  return fieldMetadata.type === type;
}
