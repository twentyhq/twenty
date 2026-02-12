import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

export const OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
] as const satisfies MetadataUniversalFlatEntityPropertiesToCompare<'objectMetadata'>[];
