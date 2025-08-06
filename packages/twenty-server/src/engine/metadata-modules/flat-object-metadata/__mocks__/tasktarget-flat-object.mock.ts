import { TASKTARGET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/tasktarget-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const TASKTARGET_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'bb2b29b8-7f46-4106-a8ae-3a32df9c9166',
  standardId: '20202020-5a9a-44e8-95df-771cd06d0fb1',
  nameSingular: 'taskTarget',
  namePlural: 'taskTargets',
  labelSingular: 'Task Target',
  labelPlural: 'Task Targets',
  description: 'A task target',
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
  labelIdentifierFieldMetadataId: '762d956d-d11a-4fe6-b6c1-182b9f63a56b',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(TASKTARGET_FLAT_FIELDS_MOCK),
});
