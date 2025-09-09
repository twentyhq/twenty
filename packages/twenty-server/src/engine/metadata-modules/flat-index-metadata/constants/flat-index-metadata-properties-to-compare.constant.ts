import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export const FLAT_INDEX_METADATA_PROPERTIES_TO_COMPARE = [
  'indexType',
  'indexWhereClause',
  'isUnique',
  'name',
] as const satisfies (keyof FlatIndexMetadata)[];
