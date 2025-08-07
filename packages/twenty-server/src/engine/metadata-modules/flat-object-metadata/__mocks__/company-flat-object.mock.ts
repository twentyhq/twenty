import { COMPANY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/company-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const COMPANY_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '7f5c2c7a-bb23-46fb-b59d-9b7a52a8d1cc',
  standardId: '20202020-b374-4779-a561-80086cb2e17f',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'IconBuildingSkyscraper',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: 'C',
  labelIdentifierFieldMetadataId: '12b304b6-ea97-4dcc-9415-9f7b2ac4b729',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(COMPANY_FLAT_FIELDS_MOCK),
});
