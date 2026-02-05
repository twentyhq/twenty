import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-by-metadata-name.constant';
import { Equal, Expect } from 'twenty-shared/testing';

type ExtractPropertyToCompare<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : P;

export type MetadataUniversalFlatEntityPropertiesToCompare<
  T extends AllMetadataName,
  MetadataConfig = (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME)[T],
> = {
  [P in keyof MetadataConfig]: ExtractPropertyToCompare<MetadataConfig, P>;
}[keyof MetadataConfig];

// TODO ignore eslint
type Assertions = [
  Expect<
    Equal<
      MetadataUniversalFlatEntityPropertiesToCompare<'fieldMetadata'>,
      | 'name'
      | 'label'
      | 'icon'
      | 'description'
      | 'isActive'
      | 'defaultValue'
      | 'standardOverrides'
      | 'options'
      | 'isUnique'
      | 'isLabelSyncedWithName'
      | 'universalSettings'
    >
  >,
];
