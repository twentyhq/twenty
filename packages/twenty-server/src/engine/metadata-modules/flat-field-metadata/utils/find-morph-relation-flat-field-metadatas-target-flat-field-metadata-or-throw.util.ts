import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { isDefined } from 'twenty-shared/utils';

export type FindMorphRelationRelatedFlatFieldMetadatasOrThrowArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
export const findMorphRelationRelatedFlatFieldMetadatasOrThrow = ({
  flatObjectMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindMorphRelationRelatedFlatFieldMetadatasOrThrowArgs): FlatFieldMetadata[] => {
  const flatObjectMetadata =
    flatObjectMetadataMaps.byId[
      morphRelationFlatFieldMetadata.objectMetadataId
    ];
  if (!isDefined(flatObjectMetadata)) {
    throw new FlatObjectMetadataMapsException(
      'object metadata not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const allRelatedMorphRelationFlatFieldMetadatas =
    flatObjectMetadata.flatFieldMetadatas.flatMap((flatFieldMetadata) => {
      if (
        !isFlatFieldMetadataEntityOfType(
          flatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) ||
        flatFieldMetadata.name !== morphRelationFlatFieldMetadata.name
      ) {
        return [];
      }

      const relationTargetFlatFieldMetadata =
        findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow({
          flatFieldMetadata,
          flatObjectMetadataMaps,
        });

      return [flatFieldMetadata, relationTargetFlatFieldMetadata];
    });

  return allRelatedMorphRelationFlatFieldMetadatas;
};
