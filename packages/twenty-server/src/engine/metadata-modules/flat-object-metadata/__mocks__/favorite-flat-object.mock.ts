import { FAVORITE_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/favorite-flat-fields.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const FAVORITE_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'f4749ffb-dde8-44ff-8b01-d3fc82df0ba2',
  standardId: '20202020-ab56-4e05-92a3-e2414a499860',
  nameSingular: 'favorite',
  namePlural: 'favorites',
  labelSingular: 'Favorite',
  labelPlural: 'Favorites',
  description: 'A favorite that can be accessed from the left menu',
  icon: 'IconHeart',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '49f58497-4e7c-49e6-b3bc-c91d4b8a8ddc',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-ab56-4e05-92a3-e2414a499860',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(FAVORITE_FLAT_FIELDS_MOCK),
});
