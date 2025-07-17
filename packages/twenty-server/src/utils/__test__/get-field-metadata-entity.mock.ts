import { faker } from '@faker-js/faker';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataType } from 'twenty-shared/types';

type GetMockFieldMetadataEntityOverride<
  T extends FieldMetadataType = FieldMetadataType,
> = Partial<FieldMetadataEntity<T>> &
  Required<Pick<FieldMetadataEntity<T>, 'workspaceId' | 'objectMetadataId'>>;

export const getMockFieldMetadataEntity = <
  T extends FieldMetadataType = FieldMetadataType,
>(
  overrides: GetMockFieldMetadataEntityOverride<T>,
): FieldMetadataEntity<T> => {
  // TODO avoid as any
  return {
    type: FieldMetadataType.TEXT as T,
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
    standardId: null,
    standardOverrides: null,
    id: faker.string.uuid(),
    name: 'defaultFieldMetadataName',
    label: 'Default field metadata entity label',
    description: 'Default field metadata entity description',
    defaultValue: null as any,
    options: [] as any,
    settings: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    ...overrides,
  };
};
