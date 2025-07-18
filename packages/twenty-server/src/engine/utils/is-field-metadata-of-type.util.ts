import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataInterfaceOfType<
  Field extends FieldMetadataInterface<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is FieldMetadataInterface<Type> {
  return fieldMetadata.type === type;
}

export function isFieldMetadataEntityOfType<Type extends FieldMetadataType>(
  fieldMetadata: unknown,
  type: Type,
): fieldMetadata is FieldMetadataEntity<Type> {
  return (fieldMetadata as { type: FieldMetadataType }).type === type;
}

//  Should implemented static typescript tests
