import { faker } from '@faker-js/faker/.';
import { FlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';

type FlattenMetadataOverrides = Required<
  Pick<FlattenObjectMetadata, 'uniqueIdentifier'>
> &
  Partial<FlattenObjectMetadata>;
export const getFlattenObjectMetadata = (
  overrides: FlattenMetadataOverrides,
): FlattenObjectMetadata => {
  const createdAt = faker.date.anytime();

  return {
    flattenFieldMetadatas: [],
    flattenIndexMetadatas: [],
    createdAt,
    dataSourceId: faker.string.uuid(),
    description: 'default flatten object metadata description',
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
    labelPlural: 'default flatten object metadata label plural',
    labelSingular: 'default flatten object metadata label singular',
    namePlural: 'defaultFlattenObjectMetdataNamePlural',
    nameSingular: 'defaultFlattenObjectMetdataNameSingular',
    shortcut: 'shortcut',
    standardId: undefined,
    standardOverrides: undefined,
    targetRelationFields: [],
    targetTableName: '',
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    ...overrides,
  };
};

export const getStandardFlattenObjectMetadata = (
  overrides: Omit<FlattenMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlattenObjectMetadata({
    standardId: faker.string.uuid(),
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
