import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

export const FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'label',
  'description',
  'icon',
] as const satisfies MetadataUniversalFlatEntityPropertiesToCompare<'fieldMetadata'>[];
