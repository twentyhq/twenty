import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-by-metadata-name.constant';

export const FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE = [
  'label',
  'description',
  'isActive',
  'standardOverrides',
  'icon',
  'name',
  'universalSettings',
] as const satisfies (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME.fieldMetadata.propertiesToCompare)[number][];
