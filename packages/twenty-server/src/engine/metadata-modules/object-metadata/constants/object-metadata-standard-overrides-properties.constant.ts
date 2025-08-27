import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';

export const OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES = [
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
] as const satisfies FlatObjectMetadataPropertiesToCompare[];
