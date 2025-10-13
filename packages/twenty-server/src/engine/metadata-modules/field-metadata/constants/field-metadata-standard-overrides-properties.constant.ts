import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';

export const FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'label',
  'description',
  'icon',
] as const satisfies FlatEntityPropertiesToCompare<'fieldMetadata'>[];
