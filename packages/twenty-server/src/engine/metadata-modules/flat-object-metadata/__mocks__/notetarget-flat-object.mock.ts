import { NOTETARGET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/notetarget-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const NOTETARGET_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '12e3cb51-c3de-4192-b0d5-965d48d001c0',
  standardId: '20202020-fff0-4b44-be82-bda313884400',
  nameSingular: 'noteTarget',
  namePlural: 'noteTargets',
  labelSingular: 'Note Target',
  labelPlural: 'Note Targets',
  description: 'A note target',
  icon: 'IconCheckbox',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '3ef6c3df-6569-4d00-b1ae-3893e8e55a7e',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-fff0-4b44-be82-bda313884400',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(NOTETARGET_FLAT_FIELDS_MOCK),
});
