import { OPPORTUNITY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/opportunity-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const OPPORTUNITY_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'e6996bbf-dd41-423a-9324-8546f5b22fa7',
  standardId: '20202020-9549-49dd-b2b2-883999db8938',
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: 'O',
  labelIdentifierFieldMetadataId: '5f510348-58e9-4ded-8dbe-144ae3644bd4',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-9549-49dd-b2b2-883999db8938',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(OPPORTUNITY_FLAT_FIELDS_MOCK),
});
