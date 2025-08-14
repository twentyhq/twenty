import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const FLAT_OBJECT_METADATA_JSONB_PROPERTIES = [
  'standardOverrides',
] as const satisfies (keyof FlatObjectMetadata)[];
