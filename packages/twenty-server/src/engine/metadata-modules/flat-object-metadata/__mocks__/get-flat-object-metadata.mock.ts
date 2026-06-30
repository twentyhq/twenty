import { faker } from '@faker-js/faker';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

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
    searchFieldMetadataIds: [],
    objectPermissionIds: [],
    fieldPermissionIds: [],
    fieldIds: [],
    description: 'default flat object metadata description',
    icon: 'icon',
    color: null,
    id: faker.string.uuid(),
    imageIdentifierFieldMetadataId,
    isActive: true,
    isAuditLogged: true,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    isUIEditable: true,
    isUICreatable: true,
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
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
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
    isSystem: true,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    ...overrides,
  });
};
