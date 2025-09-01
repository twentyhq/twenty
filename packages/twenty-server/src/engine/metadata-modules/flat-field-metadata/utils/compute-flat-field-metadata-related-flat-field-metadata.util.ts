import { FlatFieldMetadata } from "src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type";
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from "src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util";
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from "src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util";
import { isFlatFieldMetadataEntityOfType } from "src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util";
import { FlatObjectMetadataMaps } from "src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type";
import { FieldMetadataType } from "twenty-shared/types";

export const computeFlatFieldMetadataRelatedFlatFieldMetadata = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
}): FlatFieldMetadata[] => {
  if (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.RELATION,
    )
  ) {
    return [
      findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatObjectMetadataMaps,
      }),
    ];
  }

  if (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return findFlatFieldMetadatasRelatedToMorphRelationOrThrow({
      flatFieldMetadata,
      flatObjectMetadataMaps,
    });
  }

  return [];
};