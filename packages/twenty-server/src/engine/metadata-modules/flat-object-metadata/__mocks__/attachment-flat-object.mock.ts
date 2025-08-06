import { ATTACHMENT_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/attachment-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const ATTACHMENT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '819ed5ff-312f-4423-8e95-02a691cf5c27',
  standardId: '20202020-bd3d-4c60-8dca-571c71d4447a',
  nameSingular: 'attachment',
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
  description: 'An attachment',
  icon: 'IconFileImport',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'f51cfa5d-7190-48a5-b548-3e542322c144',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(ATTACHMENT_FLAT_FIELDS_MOCK),
});
