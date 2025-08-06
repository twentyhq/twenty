import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-to-flat-object-metadata-with-flat-field-maps-or-throw.util';

export type AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[flatFieldMetadata.objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    throw new FlatObjectMetadataMapsException(
      'addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow field parent object metadata not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  return {
    byId: {
      ...flatObjectMetadataMaps.byId,
      [flatFieldMetadata.objectMetadataId]:
        addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrow({
          flatFieldMetadata,
          flatObjectMetadataWithFlatFieldMaps,
        }),
    },
    idByNameSingular: flatObjectMetadataMaps.idByNameSingular,
  };
};
