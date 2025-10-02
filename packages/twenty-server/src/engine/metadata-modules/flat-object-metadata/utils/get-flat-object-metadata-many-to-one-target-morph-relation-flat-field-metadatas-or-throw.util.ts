import { FieldMetadataType } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

type GetFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrowArgs = {
  objectFlatFieldMetadatas: FlatFieldMetadataSecond[];
} & Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;
export const getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow =
  ({
    objectFlatFieldMetadatas,
    flatFieldMetadataMaps,
  }: GetFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrowArgs): FlatFieldMetadataSecond<FieldMetadataType.MORPH_RELATION>[] => {
    return objectFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
      if (
        !isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        return [];
      }

      const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow(
        {
          flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        },
      );

      return isFlatFieldMetadataOfType(
        targetFlatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
        ? targetFlatFieldMetadata
        : [];
    });
  };
