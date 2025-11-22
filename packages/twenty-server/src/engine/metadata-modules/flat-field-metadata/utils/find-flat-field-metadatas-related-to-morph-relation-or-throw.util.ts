import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatObjectMetadata: FlatObjectMetadata;
};

type FindFlatFieldMetadatasRelatedToMorphRelationOrThrowReturnType = {
  morphRelationFlatFieldMetadatas: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  relationFlatFieldMetadatas: FlatFieldMetadata<FieldMetadataType.RELATION>[];
};
export const findFlatFieldMetadatasRelatedToMorphRelationOrThrow = ({
  flatFieldMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
  flatObjectMetadata,
}: FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs): FindFlatFieldMetadatasRelatedToMorphRelationOrThrowReturnType => {
  const morphRelationFlatFieldMetadatas =
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: morphRelationFlatFieldMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    });

  const relationFlatFieldMetadatas = [
    morphRelationFlatFieldMetadata,
    ...morphRelationFlatFieldMetadatas,
  ].map((flatFieldMetadata) =>
    findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
      flatFieldMetadata,
      flatFieldMetadataMaps,
    }),
  ) as FlatFieldMetadata<FieldMetadataType.RELATION>[];

  return {
    morphRelationFlatFieldMetadatas,
    relationFlatFieldMetadatas,
  };
};
