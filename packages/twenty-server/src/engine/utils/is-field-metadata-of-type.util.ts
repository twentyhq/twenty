import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataEntityOfType<
  Field extends FieldMetadataEntity,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}
