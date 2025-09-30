import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import {
  type FlatFieldMetadata
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findObjectFieldsInFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export type FindAllMorphRelationFlatFieldMetadatasOrThrowArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
export const findAllOthersMorphRelationFlatFieldMetadatasOrThrow = ({
  flatFieldMetadataMaps,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindAllMorphRelationFlatFieldMetadatasOrThrowArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  if (
    !isDefined(flatFieldMetadataMaps.byId[morphRelationFlatFieldMetadata.id])
  ) {
    throw new FlatEntityMapsException(
      'Morph relation field not found in related object metadata',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const { objectFlatFieldMetadatas } = findObjectFieldsInFlatFieldMetadataMaps({
    flatFieldMetadataMaps,
    objectMetadataId: morphRelationFlatFieldMetadata.objectMetadataId,
  });

  return objectFlatFieldMetadatas.filter(
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
