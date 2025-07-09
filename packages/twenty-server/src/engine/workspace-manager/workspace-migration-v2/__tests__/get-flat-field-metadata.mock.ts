import { faker } from '@faker-js/faker/.';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FieldMetadataType } from 'twenty-shared/types';

type FlatMetadataOverrides = Required<
  Pick<FlatFieldMetadata, 'uniqueIdentifier' | 'objectMetadataId'>
> &
  Partial<FlatFieldMetadata>;
export const getFlatFieldMetadataMock = (
  overrides: FlatMetadataOverrides,
): FlatFieldMetadata => {
  const createdAt = faker.date.anytime();

  return {
    createdAt,
    description: 'default flat field metadata description',
    icon: 'icon',
    id: faker.string.uuid(),
    isActive: true,
    isCustom: true,
    name: 'FlatFieldMetadataName',
    label: 'flat field metadata label',
    defaultValue: undefined,
    isNullable: true,
    isUnique: false,
    options: undefined,
    relationTargetFieldMetadata: undefined,
    relationTargetFieldMetadataId: undefined,
    relationTargetObjectMetadata: undefined,
    relationTargetObjectMetadataId: undefined,
    settings: undefined,
    type: FieldMetadataType.TEXT,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: undefined,
    standardOverrides: undefined,
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    ...overrides,
  };
};

export const getStandardFlatFieldMetadata = (
  overrides: Omit<FlatMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlatFieldMetadataMock({
    standardId: faker.string.uuid(),
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
