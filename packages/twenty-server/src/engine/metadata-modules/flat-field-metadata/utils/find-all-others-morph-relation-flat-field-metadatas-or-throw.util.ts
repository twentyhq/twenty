import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type FindAllMorphRelationFlatFieldMetadatasOrThrowArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
export const findAllOthersMorphRelationFlatFieldMetadatasOrThrow = ({
  flatObjectMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindAllMorphRelationFlatFieldMetadatasOrThrowArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
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

  return flatObjectMetadataWithFlatFieldMaps.flatFieldMetadatas.filter(
    (
      flatFieldMetadata,
    ): flatFieldMetadata is FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) &&
      flatFieldMetadata.morphId === morphRelationFlatFieldMetadata.morphId &&
      flatFieldMetadata.id !== morphRelationFlatFieldMetadata.id,
  );
};
