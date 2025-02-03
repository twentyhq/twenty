import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isFieldMetadataOfType = <T extends FieldMetadataType>(
  fieldMetadata:
    | FieldMetadataInterface<'default' | T>
    | FieldMetadataEntity<'default' | T>,
  type: T,
): fieldMetadata is FieldMetadataInterface<T> | FieldMetadataEntity<T> => {
  return fieldMetadata.type === type;
};
