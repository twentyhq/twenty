import { TASK_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/task-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const TASK_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '3186920d-2a15-4b5f-96c7-2bf6567024b0',
  standardId: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
  nameSingular: 'task',
  namePlural: 'tasks',
  labelSingular: 'Task',
  labelPlural: 'Tasks',
  description: 'A task',
  icon: 'IconCheckbox',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: 'T',
  labelIdentifierFieldMetadataId: '88e4eeac-1d47-4e44-a795-bb5ca93c6557',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(TASK_FLAT_FIELDS_MOCK),
});
