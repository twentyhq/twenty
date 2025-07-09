import { faker } from '@faker-js/faker/.';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-field-metadata';
import { FieldMetadataType } from 'twenty-shared/types';

type FlattenMetadataOverrides = Required<
  Pick<FlattenFieldMetadata, 'uniqueIdentifier' | 'objectMetadataId'>
> &
  Partial<FlattenFieldMetadata>;
export const getFlattenFieldMetadata = (
  overrides: FlattenMetadataOverrides,
): FlattenFieldMetadata => {
  const createdAt = faker.date.anytime();
  const name = faker.animal.dog();
  const label = name + 'Label';

  return {
    createdAt,
    description: faker.lorem.lines(1),
    icon: 'icon',
    id: faker.string.uuid(),
    isActive: true,
    isCustom: true,
    name,
    label,
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

export const getStandardFlattenFieldMetadata = (
  overrides: Omit<FlattenMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlattenFieldMetadata({
    standardId: faker.string.uuid(),
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
