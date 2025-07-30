import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FlatFieldMetadataOverrides<
  T extends FieldMetadataType = FieldMetadataType,
> = Required<
  Pick<FlatFieldMetadata<T>, 'uniqueIdentifier' | 'objectMetadataId' | 'type'>
> &
  Partial<FlatFieldMetadata<T>>;

export const getFlatFieldMetadataMock = <T extends FieldMetadataType>(
  overrides: FlatFieldMetadataOverrides<T>,
): FlatFieldMetadata => {
  return {
    defaultValue: null,
    options: null,
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
    isLabelSyncedWithName: false,
    isSystem: false,
    standardId: null,
    standardOverrides: null,
    workspaceId: faker.string.uuid(),
    flatRelationTargetFieldMetadata: null,
    relationTargetFieldMetadataId: null,
    flatRelationTargetObjectMetadata: null,
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
