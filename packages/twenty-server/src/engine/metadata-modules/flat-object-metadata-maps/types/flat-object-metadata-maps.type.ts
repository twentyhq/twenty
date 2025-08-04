import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

export type FlatObjectMetadataMaps = {
  byId: Partial<Record<string, FlatObjectMetadataWithFlatFieldMaps>>;
  idByNameSingular: Partial<Record<string, string>>;
};
