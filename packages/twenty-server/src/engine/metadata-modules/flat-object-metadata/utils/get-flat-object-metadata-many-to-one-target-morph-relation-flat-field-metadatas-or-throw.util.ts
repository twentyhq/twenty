import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type GetFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrowArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow =
  ({
    flatObjectMetadata,
    existingFlatObjectMetadataMaps,
  }: GetFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrowArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
    const manyToOneMorphRelationTargetFlatFieldMetadataIds =
      flatObjectMetadata.flatFieldMetadatas
        .filter(
          (
            flatFieldMetadata,
          ): flatFieldMetadata is FlatFieldMetadata<FieldMetadataType.RELATION> =>
            isFlatFieldMetadataOfType(
              flatFieldMetadata,
              FieldMetadataType.RELATION,
            ) &&
            isFlatFieldMetadataOfType(
              flatFieldMetadata.flatRelationTargetFieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            ),
        )
        .map(({ id: fieldMetadataId, objectMetadataId }) => ({
          fieldMetadataId,
          objectMetadataId,
        }));

    return manyToOneMorphRelationTargetFlatFieldMetadataIds.map(
      ({ fieldMetadataId, objectMetadataId }) =>
        findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          fieldMetadataId,
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId,
        }),
    ) as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  };
