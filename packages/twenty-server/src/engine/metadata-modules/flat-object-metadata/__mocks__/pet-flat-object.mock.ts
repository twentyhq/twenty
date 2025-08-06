import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const PET_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'd34e0f07-1b8c-4de0-938e-599cf05e1f7f',
  standardId: null,
  nameSingular: 'pet',
  namePlural: 'pets',
  labelSingular: 'Pet',
  labelPlural: 'Pets',
  description: null,
  icon: 'IconCat',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: true,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: null,
  labelIdentifierFieldMetadataId: '4311d4e0-ce63-479c-a4da-5b244e2348cc',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: 'd34e0f07-1b8c-4de0-938e-599cf05e1f7f',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(PET_FLAT_FIELDS_MOCK),
});
