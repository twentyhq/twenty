import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isFieldMetadataTypeRelation = (
  fieldMetadata: FieldMetadataEntity,
): fieldMetadata is FieldMetadataEntity &
  FieldMetadataEntity<FieldMetadataType.RELATION> => {
  return fieldMetadata.type === FieldMetadataType.RELATION;
};
