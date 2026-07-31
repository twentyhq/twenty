import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Equal, type Expect } from 'twenty-shared/testing';

import { type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type MetadataUniversalFlatEntityPropertyName<
  T extends AllMetadataName,
  MetadataConfig =
    (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T],
> = {
  [P in keyof MetadataConfig]: MetadataConfig[P] extends {
    universalProperty: string;
  }
    ? MetadataConfig[P]['universalProperty']
    : P;
}[keyof MetadataConfig] &
  keyof MetadataUniversalFlatEntity<T>;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      MetadataUniversalFlatEntityPropertyName<'navigationMenuItem'>,
      | 'type'
      | 'position'
      | 'folderUniversalIdentifier'
      | 'name'
      | 'link'
      | 'icon'
      | 'color'
      | 'createdAt'
      | 'updatedAt'
      | 'viewUniversalIdentifier'
      | 'userWorkspaceId'
      | 'targetRecordId'
      | 'targetObjectMetadataUniversalIdentifier'
      | 'pageLayoutUniversalIdentifier'
    >
  >,
];
