import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const FLAT_FIELD_METADATA_JSONB_PROPERTIES = [
  'options',
  'settings',
  'standardOverrides',
  'defaultValue',
] as const satisfies (keyof FlatFieldMetadata)[];
