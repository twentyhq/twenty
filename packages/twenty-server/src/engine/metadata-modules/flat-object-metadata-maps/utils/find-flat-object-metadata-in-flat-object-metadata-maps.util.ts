import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';

export type FindFlatObjectMetadataInFlatObjectMetadataMapsArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const findFlatObjectMetadataInFlatObjectMetadataMaps = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: FindFlatObjectMetadataInFlatObjectMetadataMapsArgs):
  | FlatObjectMetadata
  | undefined => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return undefined;
  }

  return fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
    flatObjectMetadataWithFlatFieldMaps,
  );
};
