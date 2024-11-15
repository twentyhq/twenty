import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type ObjectMetadataMaps = {
  byId: Record<string, ObjectMetadataItemWithFieldMaps>;
  byNameSingular: Record<string, ObjectMetadataItemWithFieldMaps>;
  byNamePlural: Record<string, ObjectMetadataItemWithFieldMaps>;
};
