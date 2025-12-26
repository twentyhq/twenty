import { faker } from '@faker-js/faker';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FlatFieldMetadataOverrides<
  T extends FieldMetadataType = FieldMetadataType,
> = Required<
  Pick<FlatFieldMetadata, 'universalIdentifier' | 'objectMetadataId' | 'type'>
> &
  Partial<FlatFieldMetadata<T>>;

export const getFlatFieldMetadataMock = <T extends FieldMetadataType>(
  overrides: FlatFieldMetadataOverrides<T>,
): FlatFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    calendarViewIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    viewFieldIds: [],
    createdAt,
    mainGroupByFieldMetadataViewIds: [],
    updatedAt: createdAt,
    defaultValue: null,
    options: null,
    morphId: null,
    settings: null,
    description: 'default flat field metadata description',
    icon: 'icon',
    id: faker.string.uuid(),
    isActive: true,
    isCustom: true,
    name: 'flatFieldMetadataName',
    label: 'flat field metadata label',
    isNullable: true,
    isUnique: false,
    isUIReadOnly: false,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: null,
    standardOverrides: null,
    workspaceId: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
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
