import { faker } from '@faker-js/faker';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type GetMockObjectMetadataEntityOverride =
  Partial<ObjectMetadataEntity> &
    Required<
      Pick<
        ObjectMetadataEntity,
        'nameSingular' | 'namePlural' | 'id' | 'workspaceId'
      >
    >;

export const getMockObjectMetadataEntity = (
  overrides: GetMockObjectMetadataEntityOverride,
): ObjectMetadataEntity => {
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    dataSource: {} as DataSourceEntity,
    dataSourceId: faker.string.uuid(),
    description: 'default object metadata description',
    duplicateCriteria: [],
    fieldPermissions: [],
    fields: [],
    icon: null,
    imageIdentifierFieldMetadataId: null,
    labelIdentifierFieldMetadataId: null,
    indexMetadatas: [],
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    labelPlural: 'Default mock plural label',
    labelSingular: 'Default mock plural singular',
    objectPermissions: [],
    shortcut: null,
    standardId: null,
    targetRelationFields: [],
    standardOverrides: null,
    targetTableName: faker.string.uuid(),
    ...overrides,
  };
};
