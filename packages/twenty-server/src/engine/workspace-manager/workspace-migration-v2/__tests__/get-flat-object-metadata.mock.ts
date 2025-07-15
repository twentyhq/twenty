import { faker } from '@faker-js/faker';

import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';

type FlatObjectMetadataOverrides = Required<
  Pick<FlatObjectMetadata, 'uniqueIdentifier'>
> &
  Partial<FlatObjectMetadata>;
export const getFlatObjectMetadataMock = (
  overrides: FlatObjectMetadataOverrides,
): FlatObjectMetadata => {
  const createdAt = faker.date.anytime();

  return {
    flatFieldMetadatas: [],
    flatIndexMetadatas: [],
    createdAt,
    dataSourceId: faker.string.uuid(),
    description: 'default flat object metadata description',
    duplicateCriteria: [],
    icon: 'icon',
    id: faker.string.uuid(),
    imageIdentifierFieldMetadataId: faker.string.uuid(),
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    labelIdentifierFieldMetadataId: faker.string.uuid(),
    labelPlural: 'default flat object metadata label plural',
    labelSingular: 'default flat object metadata label singular',
    namePlural: 'defaultflatObjectMetadataNamePlural',
    nameSingular: 'defaultflatObjectMetadataNameSingular',
    shortcut: 'shortcut',
    standardId: undefined,
    standardOverrides: undefined,
    targetTableName: '',
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    ...overrides,
  };
};

export const getStandardFlatObjectMetadataMock = (
  overrides: Omit<FlatObjectMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlatObjectMetadataMock({
    standardId: faker.string.uuid(),
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
