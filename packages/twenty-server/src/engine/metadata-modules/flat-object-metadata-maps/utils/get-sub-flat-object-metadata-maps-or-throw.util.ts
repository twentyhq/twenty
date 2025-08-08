import { isDefined } from 'twenty-shared/utils';

import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-with-field-maps-to-flat-object-metadata-maps-or-throw.util';

export type GetSubFlatObjectMetadataMapsOrThrowArgs = {
  objectMetadataIds: string[];
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const getSubFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps: sourceFlatObjectMetadataMaps,
  objectMetadataIds,
}: GetSubFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  return objectMetadataIds.reduce(
    (flatObjectMetadataMaps, objectMetadataId) => {
      const flatObjectMetadataWithFlatFieldMaps =
        sourceFlatObjectMetadataMaps.byId[objectMetadataId];

      if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
        throw new FlatObjectMetadataMapsException(
          'getSubFlatObjectMetadataMapsOrThrow object metadata not found',
          FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      return addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow(
        {
          flatObjectMetadataMaps,
          flatObjectMetadataWithFlatFieldMaps,
        },
      );
    },
    EMPTY_FLAT_OBJECT_METADATA_MAPS,
  );
};
