import { ROCKET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/rocket-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const ROCKET_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'd78ec657-74a4-4652-a350-1f44ff62970a',
  standardId: null,
  nameSingular: 'rocket',
  namePlural: 'rockets',
  labelSingular: 'Rocket',
  labelPlural: 'Rockets',
  description: 'A rocket',
  icon: 'IconRocket',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: true,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: null,
  labelIdentifierFieldMetadataId: '9c10de36-1ade-4be1-af78-c4fc55669fbd',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: 'd78ec657-74a4-4652-a350-1f44ff62970a',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(ROCKET_FLAT_FIELDS_MOCK),
});
