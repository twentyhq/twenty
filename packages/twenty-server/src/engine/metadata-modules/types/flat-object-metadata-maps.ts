import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/types/flat-object-metadata-item-with-flat-field-maps';

export type FlatObjectMetadataMaps = {
  byId: Partial<Record<string, FlatObjectMetadataWithFlatFieldMaps>>;
  idByNameSingular: Partial<Record<string, string>>;
};
