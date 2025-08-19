import { isDefined } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import {
  type FindFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsArgs,
  findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps.util';

export const findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow =
  ({
    flatObjectMetadataMaps,
    objectMetadataId,
  }: FindFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsArgs): FlatObjectMetadataWithFlatFieldMaps => {
    const flatObjectMetadataWithFlatFieldMaps =
      findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMaps({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
      throw new FlatObjectMetadataMapsException(
        'flat object metadata with flat field maps not found in flat object metadata maps',
        FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return flatObjectMetadataWithFlatFieldMaps;
  };
