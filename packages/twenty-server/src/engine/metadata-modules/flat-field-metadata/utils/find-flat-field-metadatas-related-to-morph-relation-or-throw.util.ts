import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';

export type FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadataSecond>;
  flatFieldMetadata: FlatFieldMetadataSecond<FieldMetadataType.MORPH_RELATION>;
};
export const findFlatFieldMetadatasRelatedToMorphRelationOrThrow = ({
  flatFieldMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs): FlatFieldMetadataSecond<MorphOrRelationFieldMetadataType>[] => {
  const allMorphFlatFieldMetadatas =
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: morphRelationFlatFieldMetadata,
      flatFieldMetadataMaps,
    });

  return [
    morphRelationFlatFieldMetadata,
    ...allMorphFlatFieldMetadatas,
  ].flatMap((flatFieldMetadata) => {
    const relationTargetFlatFieldMetadata =
      findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatFieldMetadataMaps,
      });

    if (flatFieldMetadata.id === morphRelationFlatFieldMetadata.id) {
      return [relationTargetFlatFieldMetadata];
    }

    return [flatFieldMetadata, relationTargetFlatFieldMetadata];
  });
};
