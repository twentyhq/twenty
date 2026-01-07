import { faker } from '@faker-js/faker';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type GetMockFieldMetadataEntityOverride<
  T extends FieldMetadataType = FieldMetadataType,
> = Partial<FieldMetadataEntity<T>> &
  Required<
    Pick<FieldMetadataEntity<T>, 'workspaceId' | 'objectMetadataId' | 'type'>
  >;

// Should be renamed to abstract
export const getMockFieldMetadataEntity = <
  T extends FieldMetadataType = FieldMetadataType.TEXT,
>(
  overrides: GetMockFieldMetadataEntityOverride<T>,
): FieldMetadataEntity => {
  return {
    workspace: {} as WorkspaceEntity,
    calendarViews: [],
    mainGroupByFieldMetadataViews: [],
    viewFilters: [],
    viewFields: [],
    kanbanAggregateOperationViews: [],
    morphId: null,
    fieldPermissions: [],
    icon: null,
    indexFieldMetadatas: [],
    isCustom: true,
    isLabelSyncedWithName: false,
    isNullable: null,
    isUIReadOnly: false,
    isSystem: false,
    isUnique: null,
    object: {} as ObjectMetadataEntity,
    relationTargetFieldMetadata: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadata: null,
    relationTargetObjectMetadataId: null,
    standardId: null,
    standardOverrides: null,
    id: faker.string.uuid(),
    name: 'defaultFieldMetadataName',
    label: 'Default field metadata entity label',
    description: 'Default field metadata entity description',
    defaultValue: null,
    options: null,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    application: {} as ApplicationEntity,
    applicationId: faker.string.uuid(),
    universalIdentifier: faker.string.uuid(),
    ...overrides,
  };
};
