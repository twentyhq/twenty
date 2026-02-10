import {
  type HasAllProperties,
  type Equal,
  type Expect,
} from 'twenty-shared/testing';

import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      keyof FlatEntityUpdate<'fieldMetadata'>,
      | 'name'
      | 'label'
      | 'icon'
      | 'description'
      | 'isActive'
      | 'defaultValue'
      | 'standardOverrides'
      | 'options'
      | 'settings'
      | 'isUnique'
      | 'isLabelSyncedWithName'
      | 'universalSettings'
    >
  >,
  Expect<
    HasAllProperties<
      FlatEntityUpdate<'fieldMetadata'>,
      {
        universalSettings?: never;
      }
    >
  >,

  Expect<
    Equal<
      keyof FlatEntityUpdate<'objectMetadata'>,
      | 'icon'
      | 'description'
      | 'isActive'
      | 'standardOverrides'
      | 'isLabelSyncedWithName'
      | 'nameSingular'
      | 'namePlural'
      | 'labelSingular'
      | 'labelPlural'
      | 'labelIdentifierFieldMetadataId'
      | 'labelIdentifierFieldMetadataUniversalIdentifier'
    >
  >,

  Expect<
    HasAllProperties<
      FlatEntityUpdate<'objectMetadata'>,
      {
        labelIdentifierFieldMetadataUniversalIdentifier?: never;
      }
    >
  >,
];
