import { faker } from '@faker-js/faker';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataType } from 'twenty-shared/types';

type GetMockFieldMetadataEntityOverride = Partial<FieldMetadataEntity> &
  Required<Pick<FieldMetadataEntity, 'workspaceId' | 'objectMetadataId'>>;

export const getMockFieldMetadataEntity = (
  overrides: GetMockFieldMetadataEntityOverride,
): FieldMetadataEntity => {
  return {
    fieldPermissions: [],
    icon: null,
    indexFieldMetadatas: {} as any,
    isCustom: true,
    isLabelSyncedWithName: false,
    isNullable: null,
    isSystem: false,
    isUnique: null,
    object: {} as any, // TODO ?
    relationTargetFieldMetadata: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadata: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    standardId: null,
    standardOverrides: null,
    id: faker.string.uuid(),
    name: 'defaultFieldMetadataName',
    type: FieldMetadataType.TEXT,
    label: 'Default field metadata entity label',
    description: 'Default field metadata entity description',
    defaultValue: null,
    options: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    ...overrides,
  };
};
