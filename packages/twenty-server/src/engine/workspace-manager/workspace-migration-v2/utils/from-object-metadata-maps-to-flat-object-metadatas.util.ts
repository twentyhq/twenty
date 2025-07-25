import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/utils/from-object-metadata-item-with-field-maps-to-flat-object-metadata.util';

export const fromObjectMetadataMapsToFlatObjectMetadatas = (
  objectMetadataMaps: ObjectMetadataMaps,
): FlatObjectMetadata[] => {
  const objectMetadataIds = Object.keys(objectMetadataMaps.byId);

  return objectMetadataIds.flatMap<FlatObjectMetadata>((objectMetadataId) => {
    const occurrence = objectMetadataMaps.byId[objectMetadataId];

    if (!isDefined(occurrence)) {
      return [];
    }

    return fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata(occurrence);
  });
};
