import { type Equal, type Expect } from 'twenty-shared/testing';

import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      keyof UniversalFlatEntityUpdate<'fieldMetadata'>,
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

  Expect<
    Equal<
      keyof UniversalFlatEntityUpdate<'objectMetadata'>,
      | 'icon'
      | 'description'
      | 'isActive'
      | 'standardOverrides'
      | 'isLabelSyncedWithName'
      | 'nameSingular'
      | 'namePlural'
      | 'labelSingular'
      | 'labelPlural'
      | 'labelIdentifierFieldMetadataUniversalIdentifier'
    >
  >,
];
