import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Equal, type Expect } from 'twenty-shared/testing';

import { type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

type ExtractPropertyToCompare<
  MetadataConfig,
  P extends keyof MetadataConfig,
> = MetadataConfig[P] extends { universalProperty: string }
  ? MetadataConfig[P]['universalProperty']
  : P;

export type MetadataUniversalFlatEntityPropertiesToCompare<
  T extends AllMetadataName,
  MetadataConfig = (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
> = {
  [P in keyof MetadataConfig]: ExtractPropertyToCompare<MetadataConfig, P>;
}[keyof MetadataConfig] &
  keyof MetadataUniversalFlatEntity<T>;

// eslint-disable-next-line unused-imports/no-unused-vars
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

  Expect<
    Equal<
      MetadataUniversalFlatEntityPropertiesToCompare<'view'>,
      | 'name'
      | 'icon'
      | 'deletedAt'
      | 'type'
      | 'position'
      | 'key'
      | 'isCompact'
      | 'openRecordIn'
      | 'kanbanAggregateOperation'
      | 'kanbanAggregateOperationFieldMetadataUniversalIdentifier'
      | 'calendarLayout'
      | 'calendarFieldMetadataUniversalIdentifier'
      | 'mainGroupByFieldMetadataUniversalIdentifier'
      | 'shouldHideEmptyGroups'
      | 'anyFieldFilterValue'
      | 'visibility'
      | 'createdByUserWorkspaceId'
    >
  >,
];
