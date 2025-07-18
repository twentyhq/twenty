import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type GetMockFieldMetadataEntityOverride<
  T extends FieldMetadataType = FieldMetadataType,
> = Partial<FieldMetadataEntity<T>> &
  Required<Pick<FieldMetadataEntity<T>, 'workspaceId' | 'objectMetadataId'>>;

export const getMockFieldMetadataEntity = <
  T extends FieldMetadataType = FieldMetadataType,
>(
  overrides: GetMockFieldMetadataEntityOverride<T>,
  // Returning a FieldMetadataEntity is intented we want it to be abstracted
): FieldMetadataEntity => {
  // TODO avoid as any
  return {
    type: FieldMetadataType.TEXT,
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
    defaultValue: null,
    options: [],
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    ...overrides,
  };
};
