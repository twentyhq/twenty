import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-item-with-field-maps-to-flat-object-metadata.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const fromObjectMetadataMapsToFlatObjectMetadatas = (
  objectMetadataMaps: ObjectMetadataMaps,
): FlatObjectMetadata[] => {
  const objectMetadataIds = Object.values(objectMetadataMaps.byId).filter(
    isDefined,
  );

  return objectMetadataIds.flatMap<FlatObjectMetadata>(
    (objectMetadataItemWithFieldMaps) =>
      fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata({
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      }),
  );
};
