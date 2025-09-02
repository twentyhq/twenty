import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
export const findFlatFieldMetadatasRelatedToMorphRelationOrThrow = ({
  flatObjectMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindFlatFieldMetadatasRelatedToMorphRelationOrThrowArgs): FlatFieldMetadata<MorphOrRelationFieldMetadataType>[] => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[
      morphRelationFlatFieldMetadata.objectMetadataId
    ];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    throw new FlatObjectMetadataMapsException(
      'Morph field relation object metadata not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  if (
    !isDefined(
      flatObjectMetadataWithFlatFieldMaps.fieldsById[
        morphRelationFlatFieldMetadata.id
      ],
    )
  ) {
    throw new FlatObjectMetadataMapsException(
      'Morph relation field not found in related object metadata',
      FlatObjectMetadataMapsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return flatObjectMetadataWithFlatFieldMaps.flatFieldMetadatas.flatMap(
    (flatFieldMetadata) => {
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

      if (flatFieldMetadata.id === morphRelationFlatFieldMetadata.id) {
        return [relationTargetFlatFieldMetadata];
      }

      return [flatFieldMetadata, relationTargetFlatFieldMetadata];
    },
  );
};
