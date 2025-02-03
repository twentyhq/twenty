import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function isFieldMetadataOfType<T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface<'default' | T>,
  type: T,
): fieldMetadata is FieldMetadataInterface<T>;
export function isFieldMetadataOfType<T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataEntity<'default' | T>,
  type: T,
): fieldMetadata is FieldMetadataEntity<T>;
export function isFieldMetadataOfType<T extends FieldMetadataType>(
  fieldMetadata:
    | FieldMetadataInterface<'default' | T>
    | FieldMetadataEntity<'default' | T>,
  type: T,
): boolean {
  return fieldMetadata.type === type;
}
