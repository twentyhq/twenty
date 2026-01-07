import { faker } from '@faker-js/faker';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
    workspace: {} as WorkspaceEntity,
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
    isUIReadOnly: false,
    labelPlural: 'Default mock plural label',
    labelSingular: 'Default mock plural singular',
    objectPermissions: [],
    shortcut: null,
    standardId: null,
    universalIdentifier: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    application: {} as ApplicationEntity,
    targetRelationFields: [],
    standardOverrides: null,
    targetTableName: faker.string.uuid(),
    views: [],
    ...overrides,
  };
};
