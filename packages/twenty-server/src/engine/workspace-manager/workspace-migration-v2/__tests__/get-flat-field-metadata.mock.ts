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
  T extends FieldMetadataType = FieldMetadataType,
>(
  overrides: FlatFieldMetadataOverrides<T>,
): FlatFieldMetadata<T> => {
  const createdAt = faker.date.anytime();

  return {
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
    relationTargetFieldMetadataId: undefined,
    relationTargetObjectMetadataId: undefined,
    type: FieldMetadataType.TEXT as T,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: undefined,
    standardOverrides: undefined,
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
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
