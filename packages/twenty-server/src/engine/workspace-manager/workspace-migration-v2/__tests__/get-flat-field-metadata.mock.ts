import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';

type FlatFieldMetadataOverrides<
  T extends FieldMetadataType = FieldMetadataType,
> = Required<
  Pick<FlatFieldMetadata<T>, 'uniqueIdentifier' | 'objectMetadataId'>
> &
  Partial<FlatFieldMetadata<T>>;

export const getFlatFieldMetadataMock = <
  T extends FieldMetadataType = FieldMetadataType.TEXT,
>(
  overrides: FlatFieldMetadataOverrides<T>,
): FlatFieldMetadata<T> => {
  const createdAt = faker.date.anytime();

  return {
    type: FieldMetadataType.TEXT as T,
    createdAt,
    description: 'default flat field metadata description',
    icon: 'icon',
    id: faker.string.uuid(),
    isActive: true,
    isCustom: true,
    name: 'flatFieldMetadataName',
    label: 'flat field metadata label',
    isNullable: true,
    isUnique: false,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: null,
    standardOverrides: undefined,
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    defaultValue: null,
    options: null,
    relationTargetFieldMetadata: undefined as never,
    relationTargetFieldMetadataId: undefined as never,
    relationTargetObjectMetadata: undefined as never,
    relationTargetObjectMetadataId: undefined as never,
    ...overrides,
  };
};

export const getStandardFlatFieldMetadataMock = (
  overrides: Omit<FlatFieldMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlatFieldMetadataMock({
    standardId: faker.string.uuid(),
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
