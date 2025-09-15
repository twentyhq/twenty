import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export const EMPTY_FLAT_OBJECT_METADATA_MAPS = {
  byId: {},
  idByNameSingular: {},
  idByUniversalIdentifier: {},
} as const satisfies FlatObjectMetadataMaps;
