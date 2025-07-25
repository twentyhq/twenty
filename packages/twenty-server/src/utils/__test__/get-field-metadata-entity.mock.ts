import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
    fieldPermissions: [],
    icon: null,
    indexFieldMetadatas: {} as IndexFieldMetadataEntity,
    isCustom: true,
    isLabelSyncedWithName: false,
    isNullable: null,
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
    ...overrides,
  };
};
