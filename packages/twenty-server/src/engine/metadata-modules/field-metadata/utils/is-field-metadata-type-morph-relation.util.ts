import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isFieldMetadataTypeMorphRelation = (
  fieldMetadata: FieldMetadataEntity,
): fieldMetadata is FieldMetadataEntity &
  FieldMetadataEntity<FieldMetadataType.MORPH_RELATION> => {
  return fieldMetadata.type === FieldMetadataType.MORPH_RELATION;
};
