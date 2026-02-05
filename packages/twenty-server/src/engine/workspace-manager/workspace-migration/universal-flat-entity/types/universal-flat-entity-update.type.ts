import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { Expect } from 'twenty-shared/testing';

export type UniversalFlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<
    MetadataUniversalFlatEntity<T>,
    Extract<
      keyof MetadataUniversalFlatEntity<T>,
      MetadataUniversalFlatEntityPropertiesToCompare<T>
    >
  >
>;

export type FlatEntityUpdate<T extends AllMetadataName> = Partial<
  Pick<
    MetadataFlatEntity<T>,
    Extract<
      keyof MetadataFlatEntity<T>,
      keyof (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
    >
  >
>;

// TODO ignore eslint
type Assertions = [
  Expect<
    'settings' extends keyof FlatEntityUpdate<'fieldMetadata'> ? true : false
  >,
  Expect<
    'universalSettings' extends keyof FlatEntityUpdate<'fieldMetadata'>
      ? false
      : true
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
