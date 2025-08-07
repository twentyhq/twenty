import { isDefined } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-with-field-maps-to-flat-object-metadata-maps-or-throw.util';

export type ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs =
  {
    objectMetadataIds: string[];
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
export const extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow =
  ({
    flatObjectMetadataMaps: sourceFlatObjectMetadataMaps,
    objectMetadataIds,
  }: ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
    const emptyFlatObjectMetadataMaps: FlatObjectMetadataMaps = {
      byId: {},
      idByNameSingular: {},
    };

    return objectMetadataIds.reduce(
      (flatObjectMetadataMaps, objectMetadataId) => {
        const flatObjectMetadataWithFlatFieldMaps =
          sourceFlatObjectMetadataMaps.byId[objectMetadataId];

        if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
          throw new FlatObjectMetadataMapsException(
            'extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow object metadata not found',
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
      emptyFlatObjectMetadataMaps,
    );
  };
