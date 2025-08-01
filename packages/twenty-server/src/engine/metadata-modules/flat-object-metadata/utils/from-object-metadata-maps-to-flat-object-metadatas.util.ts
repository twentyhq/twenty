import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-item-with-field-maps-to-flat-object-metadata.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';

export const fromObjectMetadataMapsToFlatObjectMetadatas = (
  objectMetadataMaps: ObjectMetadataMaps,
): FlatObjectMetadata[] => {
  const objectMetadataIds = Object.keys(objectMetadataMaps.byId);

  return objectMetadataIds.flatMap<FlatObjectMetadata>((objectMetadataId) => {
    const objectMetadataItemWithFieldMaps =
      objectMetadataMaps.byId[objectMetadataId];

    if (!isDefined(objectMetadataItemWithFieldMaps)) {
      throw new WorkspaceMetadataCacheException(
        'Object metadata not found in cache',
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    return fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata({
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });
  });
};
