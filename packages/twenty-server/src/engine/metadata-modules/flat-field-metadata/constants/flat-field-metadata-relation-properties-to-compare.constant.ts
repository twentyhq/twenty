import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';

export const FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE = [
  'label',
  'description',
  'isActive',
  'standardOverrides',
  'icon',
  'name',
  'settings',
] as const satisfies (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY.fieldMetadata.propertiesToCompare)[number][];
