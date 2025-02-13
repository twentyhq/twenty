import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataEntityOfType<
  Field extends FieldMetadataEntity<FieldMetadataType>,
  Type extends Field['type'],
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}

export function isFieldMetadataInterfaceOfType<
  Field extends FieldMetadataInterface<FieldMetadataType>,
  Type extends Field['type'],
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataInterface<Type> {
  return fieldMetadata.type === type;
}
