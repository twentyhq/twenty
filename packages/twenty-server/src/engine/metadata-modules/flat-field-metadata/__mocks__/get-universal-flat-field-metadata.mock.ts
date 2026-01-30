import { faker } from '@faker-js/faker';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type UniversalFlatFieldMetadataOverrides = {
  universalIdentifier: string;
  type: FieldMetadataType;
} & Partial<UniversalFlatFieldMetadata>;

export const getUniversalFlatFieldMetadataMock = (
  overrides: UniversalFlatFieldMetadataOverrides,
): UniversalFlatFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    calendarViewUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    createdAt,
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    updatedAt: createdAt,
    defaultValue: null,
    options: null,
    morphId: null,
    description: 'default universal flat field metadata description',
    icon: 'icon',
    isActive: true,
    isCustom: true,
    name: 'universalFlatFieldMetadataName',
    label: 'universal flat field metadata label',
    isNullable: true,
    isUnique: false,
    isUIReadOnly: false,
    isLabelSyncedWithName: false,
    isSystem: false,
    standardOverrides: null,
    applicationUniversalIdentifier: faker.string.uuid(),
    objectUniversalIdentifier: faker.string.uuid(),
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    universalSettings: null,
    ...overrides,
  } as UniversalFlatFieldMetadata;
};

export const getStandardUniversalFlatFieldMetadataMock = (
  overrides: Omit<UniversalFlatFieldMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getUniversalFlatFieldMetadataMock({
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
