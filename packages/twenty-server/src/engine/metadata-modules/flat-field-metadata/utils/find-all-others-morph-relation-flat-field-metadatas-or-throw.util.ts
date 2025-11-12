import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FindAllMorphRelationFlatFieldMetadatasOrThrowArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatObjectMetadata: FlatObjectMetadata;
};
export const findAllOthersMorphRelationFlatFieldMetadatasOrThrow = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
  flatFieldMetadata: morphRelationFlatFieldMetadata,
}: FindAllMorphRelationFlatFieldMetadatasOrThrowArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  if (
    !isDefined(flatFieldMetadataMaps.byId[morphRelationFlatFieldMetadata.id])
  ) {
    throw new FlatEntityMapsException(
      'Morph relation field not found in flat field metadata maps',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
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
