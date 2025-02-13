import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

export function isFieldMetadataOfType<
  T extends FieldMetadataInterface<FieldMetadataType>,
  Type extends T['type'],
>(
  fieldMetadata: T,
  type: Type,
): fieldMetadata is T & {
  type: Type;
  // defaultValue?: FieldMetadataDefaultValue<Type>;
  // options?: FieldMetadataOptions<Type>;
  // settings?: FieldMetadataSettings<Type>;
} {
  return fieldMetadata.type === type;
}
