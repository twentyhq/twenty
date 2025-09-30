import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const computeFlatFieldMetadataRelatedFlatFieldMetadata = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata[] => {
  if (
    isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.RELATION)
  ) {
    return [
      findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatFieldMetadataMaps,
      }),
    ];
  }

  if (
    isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return findFlatFieldMetadatasRelatedToMorphRelationOrThrow({
      flatFieldMetadata,
      flatFieldMetadataMaps,
    });
  }

  return [];
};
