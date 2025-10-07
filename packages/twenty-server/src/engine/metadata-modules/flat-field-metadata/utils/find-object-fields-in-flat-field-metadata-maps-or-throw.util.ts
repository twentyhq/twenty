import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FindObjectFieldsInFlatFieldMetadataMapsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadata: FlatObjectMetadata;
};
export const findObjectFieldsInFlatFieldMetadataMapsOrThrow = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: FindObjectFieldsInFlatFieldMetadataMapsArgs): {
  objectFlatFieldMetadataById: FlatEntityMaps<FlatFieldMetadata>;
  objectFlatFieldMetadatas: FlatFieldMetadata[];
} => {
  const objectFlatFieldMetadataById = getSubFlatEntityMapsOrThrow({
    flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  const objectFlatFieldMetadatas = Object.values(
    objectFlatFieldMetadataById.byId,
  ).filter(isDefined);

  return {
    objectFlatFieldMetadataById,
    objectFlatFieldMetadatas,
  };
};
