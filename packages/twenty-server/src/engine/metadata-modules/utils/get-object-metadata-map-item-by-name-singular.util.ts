import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getObjectMetadataMapItemByNameSingular = (
  objectMetadataMaps: ObjectMetadataMaps,
  nameSingular: string,
): ObjectMetadataItemWithFieldMaps | undefined => {
  return objectMetadataMaps.byId[
    objectMetadataMaps.idByNameSingular[nameSingular]
  ];
};
