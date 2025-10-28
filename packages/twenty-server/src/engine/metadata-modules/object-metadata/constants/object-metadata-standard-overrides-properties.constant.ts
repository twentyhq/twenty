import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';

export const OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
] as const satisfies FlatEntityPropertiesToCompare<'objectMetadata'>[];
