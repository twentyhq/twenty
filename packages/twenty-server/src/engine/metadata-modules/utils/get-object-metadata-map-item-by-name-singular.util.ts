import { isNonEmptyString } from '@sniptt/guards';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getObjectMetadataMapItemByNameSingular = (
  objectMetadataMaps: ObjectMetadataMaps,
  nameSingular: string,
): ObjectMetadataItemWithFieldMaps | undefined => {
  const objectMetadataId = objectMetadataMaps.idByNameSingular[nameSingular];

  if (!isNonEmptyString(objectMetadataId)) {
    return undefined;
  }

  return objectMetadataMaps.byId[objectMetadataId];
};
