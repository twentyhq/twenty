import { type ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';

export const FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE = [
  'label',
  'description',
  'isActive',
  'standardOverrides',
  'icon',
  'name',
  'universalSettings', // TODO prastoin VERY IMPORTANT
] as const satisfies (typeof ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY.fieldMetadata.propertiesToCompare)[number][];
