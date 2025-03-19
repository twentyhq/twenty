import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataOfType<
  Field extends FieldMetadataInterface<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataInterface<Type>;
export function isFieldMetadataOfType<
  Field extends FieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Field,
  type: Type,
): fieldMetadata is Field & FieldMetadataEntity<Type>;
export function isFieldMetadataOfType<
  Field extends
    | FieldMetadataInterface<FieldMetadataType>
    | FieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(fieldMetadata: Field, type: Type): boolean {
  return fieldMetadata.type === type;
}
