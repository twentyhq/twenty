import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';

type GetFlatObjectMetadataMorphRelationFlatFieldMetadatasArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const getFlatObjectMetadataManyToOneTargetMorphRelationFlatFieldMetadatasOrThrow =
  ({
    flatObjectMetadata,
    existingFlatObjectMetadataMaps,
  }: GetFlatObjectMetadataMorphRelationFlatFieldMetadatasArgs) => {
    const manyToOneMorhRelationTargetFlatFieldMetadataIds =
      flatObjectMetadata.flatFieldMetadatas
        .filter(
          (
            flatFieldMetadata,
          ): flatFieldMetadata is FlatFieldMetadata<FieldMetadataType.RELATION> =>
            isFlatFieldMetadataEntityOfType(
              flatFieldMetadata,
              FieldMetadataType.RELATION,
            ) &&
            flatFieldMetadata.settings.relationType ===
              RelationType.MANY_TO_ONE &&
            isFlatFieldMetadataEntityOfType(
              flatFieldMetadata.flatRelationTargetFieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            ),
        )
        .map(({ id: fieldMetadataId, objectMetadataId }) => ({
          fieldMetadataId,
          objectMetadataId,
        }));

    return manyToOneMorhRelationTargetFlatFieldMetadataIds.map(
      ({ fieldMetadataId, objectMetadataId }) =>
        findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          fieldMetadataId,
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId,
        }),
    ) as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  };
