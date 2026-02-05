import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { Equal, Expect } from 'twenty-shared/testing';

export type UniversalFlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<
    MetadataUniversalFlatEntity<T>,
    MetadataUniversalFlatEntityPropertiesToCompare<T>
  >
>;

type IsUniversalMappedProperty<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : never;

export type FlatEntityUpdate<
  T extends AllMetadataName,
  MetadataPropertyConfig = (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
> = Partial<
  Pick<
    MetadataFlatEntity<T>,
    Extract<keyof MetadataFlatEntity<T>, keyof MetadataPropertyConfig>
  >
> & {
  [K in keyof MetadataPropertyConfig as [never] extends IsUniversalMappedProperty<
    MetadataPropertyConfig,
    K
  >
    ? never
    : IsUniversalMappedProperty<MetadataPropertyConfig, K>]?: never;
};

// TODO ignore eslint
type Assertions = [
  Expect<
    'settings' extends keyof FlatEntityUpdate<'fieldMetadata'> ? true : false
  >,
  Expect<
    Equal<
      FlatEntityUpdate<'fieldMetadata'>['universalSettings'],
      never | undefined
    >
  >,

  Expect<
    'settings' extends keyof UniversalFlatEntityUpdate<'fieldMetadata'>
      ? false
      : true
  >,
  Expect<
    'universalSettings' extends keyof UniversalFlatEntityUpdate<'fieldMetadata'>
      ? true
      : false
  >,
];
