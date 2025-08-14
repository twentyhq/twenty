import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';

export const FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE = [
  'label',
  'description',
  'isActive',
] as const satisfies FlatFieldMetadataPropertiesToCompare[];
