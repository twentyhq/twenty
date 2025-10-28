import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export function isFlatFieldMetadataOfTypes<
  Field extends FlatFieldMetadata<FieldMetadataType>,
  Types extends FieldMetadataType[],
>(
  fieldMetadata: Pick<Field, 'type'>,
  types: Types,
): fieldMetadata is Field & FlatFieldMetadata<Types[number]> {
  return types.includes(fieldMetadata.type);
}
