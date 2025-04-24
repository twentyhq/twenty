import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataInterfaceOfType<
  Field extends FieldMetadataInterface<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataInterface<Type> {
  return fieldMetadata.type === type;
}

export function isFieldMetadataEntityOfType<
  Field extends FieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}
