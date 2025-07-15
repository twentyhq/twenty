import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type ObjectMetadataMaps = {
  byId: Partial<Record<string, ObjectMetadataItemWithFieldMaps>>;
  idByNameSingular: Partial<Record<string, string>>;
};
