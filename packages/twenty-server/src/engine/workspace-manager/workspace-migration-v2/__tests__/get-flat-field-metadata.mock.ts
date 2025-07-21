import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';

type FlatFieldMetadataOverrides<
  T extends FieldMetadataType = FieldMetadataType,
> = Required<
  Pick<FlatFieldMetadata<T>, 'uniqueIdentifier' | 'objectMetadataId' | 'type'>
> &
  Partial<FlatFieldMetadata<T>>;

export const getFlatFieldMetadataMock = <T extends FieldMetadataType>(
  overrides: FlatFieldMetadataOverrides<T>,
): FlatFieldMetadata => {
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
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: null,
    standardOverrides: null,
    settings: null,
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
