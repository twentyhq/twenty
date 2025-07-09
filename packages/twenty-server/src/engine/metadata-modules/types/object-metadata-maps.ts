import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type ObjectMetadataMaps = {
  byId: Map<string, ObjectMetadataItemWithFieldMaps>;
  idByNameSingular: Map<string, string>;
};
