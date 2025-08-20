import { PERSON_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/person-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const PERSON_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '843e0b67-9619-4628-91c4-2fa62256a611',
  standardId: '20202020-e674-48e5-a542-72570eee7213',
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  description: 'A person',
  icon: 'IconUser',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: 'P',
  labelIdentifierFieldMetadataId: 'f410c1cd-2523-4802-be8e-1acc852b4b1a',
  imageIdentifierFieldMetadataId: '05e46775-93e9-46c4-8b6f-94829045b1ad',
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(PERSON_FLAT_FIELDS_MOCK),
});
