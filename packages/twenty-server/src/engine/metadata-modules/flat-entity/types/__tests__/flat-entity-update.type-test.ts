import { type Equal, type Expect } from 'twenty-shared/testing';

import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

// eslint-disable-next-line unused-imports/no-unused-vars
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
