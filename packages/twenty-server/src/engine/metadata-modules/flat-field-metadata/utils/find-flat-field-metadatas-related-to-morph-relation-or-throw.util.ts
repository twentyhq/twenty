import { type FieldMetadataType } from 'twenty-shared/types';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
export const findFlatFieldMetadatasRelatedToMorphRelationOrThrow = ({
  flatObjectMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs): FlatFieldMetadata<MorphOrRelationFieldMetadataType>[] => {
  const allMorphFlatFieldMetadatas =
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: morphRelationFlatFieldMetadata,
      flatObjectMetadataMaps,
    });

  return allMorphFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
    const relationTargetFlatFieldMetadata =
      findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatObjectMetadataMaps,
      });

    if (flatFieldMetadata.id === morphRelationFlatFieldMetadata.id) {
      return [relationTargetFlatFieldMetadata];
    }

    return [flatFieldMetadata, relationTargetFlatFieldMetadata];
  });
};
