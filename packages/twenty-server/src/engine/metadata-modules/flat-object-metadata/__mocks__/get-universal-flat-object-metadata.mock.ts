import { faker } from '@faker-js/faker';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type UniversalFlatObjectMetadataOverrides = Required<
  Pick<UniversalFlatObjectMetadata, 'universalIdentifier'>
> &
  Partial<UniversalFlatObjectMetadata>;

export const getUniversalFlatObjectMetadataMock = (
  overrides: UniversalFlatObjectMetadataOverrides,
): UniversalFlatObjectMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier =
    overrides.applicationUniversalIdentifier ?? faker.string.uuid();
  const labelIdentifierFieldMetadataUniversalIdentifier =
    overrides.labelIdentifierFieldMetadataUniversalIdentifier ??
    faker.string.uuid();
  const imageIdentifierFieldMetadataUniversalIdentifier =
    overrides.imageIdentifierFieldMetadataUniversalIdentifier ??
    faker.string.uuid();

  return {
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    fieldUniversalIdentifiers: [],
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    description: 'default universal flat object metadata description',
    icon: 'icon',
    isActive: true,
    isAuditLogged: true,
    isCustom: true,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    isUIReadOnly: false,
    labelPlural: 'default universal flat object metadata label plural',
    labelSingular: 'default universal flat object metadata label singular',
    namePlural: 'defaultUniversalFlatObjectMetadataNamePlural',
    nameSingular: 'defaultUniversalFlatObjectMetadataNameSingular',
    shortcut: 'shortcut',
    standardOverrides: null,
    targetTableName: '',
    createdAt,
    updatedAt: createdAt,
    duplicateCriteria: null,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
    ...overrides,
  } as UniversalFlatObjectMetadata;
};

export const getStandardUniversalFlatObjectMetadataMock = (
  overrides: Omit<
    UniversalFlatObjectMetadataOverrides,
    'isCustom' | 'isSystem'
  >,
) => {
  return getUniversalFlatObjectMetadataMock({
    standardOverrides: {},
    isCustom: false,
    isSystem: true,
    ...overrides,
  });
};
