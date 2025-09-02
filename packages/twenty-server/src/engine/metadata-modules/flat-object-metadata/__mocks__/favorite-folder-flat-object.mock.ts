import { FAVORITE_FOLDER_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/favorite-folder-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const FAVORITE_FOLDER_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '35763b74-1abe-4c4b-9eab-27693f0ee06d',
  standardId: '20202020-7cf8-401f-8211-a9587d27fd2d',
  nameSingular: 'favoriteFolder',
  namePlural: 'favoriteFolders',
  labelSingular: 'Favorite Folder',
  labelPlural: 'Favorite Folders',
  description: 'A Folder of favorites',
  icon: 'IconFolder',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '85ab1864-0a92-4682-8583-82e8b696410b',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  universalIdentifier: '20202020-7cf8-401f-8211-a9587d27fd2d',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(FAVORITE_FOLDER_FLAT_FIELDS_MOCK),
});
