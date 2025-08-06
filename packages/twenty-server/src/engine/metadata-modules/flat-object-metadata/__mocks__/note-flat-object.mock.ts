import { NOTE_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/note-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const NOTE_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '1253e3e5-5b00-4a34-93b8-02f3dc6e2b7c',
  standardId: '20202020-0b00-45cd-b6f6-6cd806fc6804',
  nameSingular: 'note',
  namePlural: 'notes',
  labelSingular: 'Note',
  labelPlural: 'Notes',
  description: 'A note',
  icon: 'IconNotes',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: 'N',
  labelIdentifierFieldMetadataId: '3cb30a3f-31c1-47d3-a61e-e537615390c8',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-0b00-45cd-b6f6-6cd806fc6804',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(NOTE_FLAT_FIELDS_MOCK),
});
