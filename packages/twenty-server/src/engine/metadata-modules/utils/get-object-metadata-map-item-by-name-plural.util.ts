import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getObjectMetadataMapItemByNamePlural = (
  objectMetadataMaps: ObjectMetadataMaps,
  namePlural: string,
): ObjectMetadataItemWithFieldMaps | undefined => {
  const objectMetadataItems = Object.values(objectMetadataMaps.byId);

  return objectMetadataItems.find(
    (objectMetadata) => objectMetadata.namePlural === namePlural,
  );
};
