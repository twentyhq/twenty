import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export function isFlatFieldMetadataEntityOfType<
  Field extends FlatFieldMetadata<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FlatFieldMetadata<Type> {
  return fieldMetadata.type === type;
}

export function isFlatFieldMetadataEntityOfTypes<
  Field extends FlatFieldMetadata<FieldMetadataType>,
  Types extends FieldMetadataType[],
>(
  fieldMetadata: Pick<Field, 'type'>,
  types: Types,
): fieldMetadata is Field & FlatFieldMetadata<Types[number]> {
  return types.includes(fieldMetadata.type);
}
