import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properites-to-compare.type';

export const FLAT_INDEX_METADATA_JSONB_PROPERTIES = [
  'flatIndexFieldMetadatas',
] as const satisfies FlatIndexMetadataPropertiesToCompare[];
