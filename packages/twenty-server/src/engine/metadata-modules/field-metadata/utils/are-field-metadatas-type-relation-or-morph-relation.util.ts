import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';

export const areFieldMetadatasTypeRelationOrMorphRelation = (
  fieldMetadatas: FieldMetadataEntity[],
): fieldMetadatas is Array<
  FieldMetadataEntity &
    FieldMetadataEntity<
      FieldMetadataType.MORPH_RELATION | FieldMetadataType.RELATION
    >
> => {
  return fieldMetadatas.every(
    (fieldMetadata) =>
      isFieldMetadataTypeRelation(fieldMetadata) ||
      isFieldMetadataTypeMorphRelation(fieldMetadata),
  );
};
