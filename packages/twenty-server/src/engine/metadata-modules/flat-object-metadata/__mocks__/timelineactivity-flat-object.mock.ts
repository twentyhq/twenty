import { TIMELINEACTIVITY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/timelineactivity-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const TIMELINEACTIVITY_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '3090f830-c4b1-41a1-8e18-815760830bec',
  standardId: '20202020-6736-4337-b5c4-8b39fae325a5',
  nameSingular: 'timelineActivity',
  namePlural: 'timelineActivities',
  labelSingular: 'Timeline Activity',
  labelPlural: 'Timeline Activities',
  description: 'Aggregated / filtered event to be displayed on the timeline',
  icon: 'IconTimelineEvent',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'e78264fa-48bc-46cd-afc1-c5f2b5eb9472',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(TIMELINEACTIVITY_FLAT_FIELDS_MOCK),
});
