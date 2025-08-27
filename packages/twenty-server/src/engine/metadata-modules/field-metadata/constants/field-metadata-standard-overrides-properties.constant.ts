import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';

export const FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'label',
  'description',
  'icon',
] as const satisfies FlatFieldMetadataPropertiesToCompare[];
