import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataEntityOfType<
  Field extends FieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}
