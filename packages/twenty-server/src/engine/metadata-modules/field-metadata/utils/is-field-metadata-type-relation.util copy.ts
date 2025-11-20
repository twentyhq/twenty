import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFlatFieldMetadataTypeRelationOrMorphRelation = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<
  FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
> => {
  return (
    flatFieldMetadata.type === FieldMetadataType.RELATION ||
    flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION
  );
};
