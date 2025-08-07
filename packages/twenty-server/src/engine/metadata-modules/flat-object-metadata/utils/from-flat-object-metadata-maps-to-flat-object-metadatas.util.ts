import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';

export const fromFlatObjectMetadataMapsToFlatObjectMetadatas = (
  flatObjectMetadataMaps: FlatObjectMetadataMaps,
): FlatObjectMetadata[] => {
  return Object.values(flatObjectMetadataMaps.byId)
    .filter(isDefined)
    .map(fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata);
};
