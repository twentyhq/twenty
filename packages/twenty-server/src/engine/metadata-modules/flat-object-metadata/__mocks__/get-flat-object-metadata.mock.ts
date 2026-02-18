import { faker } from '@faker-js/faker';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FlatObjectMetadataOverrides = Required<
  Pick<FlatObjectMetadata, 'universalIdentifier'>
> &
  Partial<FlatObjectMetadata>;
export const getFlatObjectMetadataMock = (
  overrides: FlatObjectMetadataOverrides,
): FlatObjectMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';
  const applicationId = overrides.applicationId ?? faker.string.uuid();
  const labelIdentifierFieldMetadataId =
    overrides.labelIdentifierFieldMetadataId ?? faker.string.uuid();
  const imageIdentifierFieldMetadataId =
    overrides.imageIdentifierFieldMetadataId ?? faker.string.uuid();

  return {
    viewIds: [],
    indexMetadataIds: [],
    fieldIds: [],
    description: 'default flat object metadata description',
    icon: 'icon',
    id: faker.string.uuid(),
    imageIdentifierFieldMetadataId,
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    isUIReadOnly: false,
    labelIdentifierFieldMetadataId,
    labelPlural: 'default flat object metadata label plural',
    labelSingular: 'default flat object metadata label singular',
    namePlural: 'defaultflatObjectMetadataNamePlural',
    nameSingular: 'defaultflatObjectMetadataNameSingular',
    shortcut: 'shortcut',
    applicationId,
    standardOverrides: null,
    targetTableName: '',
    workspaceId: faker.string.uuid(),
    createdAt,
    updatedAt: createdAt,
    duplicateCriteria: null,
    applicationUniversalIdentifier: applicationId,
    fieldUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier:
      labelIdentifierFieldMetadataId,
    imageIdentifierFieldMetadataUniversalIdentifier:
      imageIdentifierFieldMetadataId,
    ...overrides,
  };
};

export const getStandardFlatObjectMetadataMock = (
  overrides: Omit<FlatObjectMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlatObjectMetadataMock({
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
