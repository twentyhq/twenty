import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

export type FindFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsArgs =
  {
    objectMetadataId: string;
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
  };

export const findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMaps =
  ({
    flatObjectMetadataMaps,
    objectMetadataId,
  }: FindFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsArgs):
    | FlatObjectMetadataWithFlatFieldMaps
    | undefined => {
    const flatObjectMetadataWithFlatFieldMaps =
      flatObjectMetadataMaps.byId[objectMetadataId];

    if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
      return undefined;
    }

    return flatObjectMetadataWithFlatFieldMaps;
  };
