import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getObjectMetadataMapItemByNameSingular = (
  objectMetadataMaps: ObjectMetadataMaps,
  nameSingular: string,
) => {
  return objectMetadataMaps.byId[
    objectMetadataMaps.idByNameSingular[nameSingular]
  ];
};
