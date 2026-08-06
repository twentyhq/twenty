import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Key names are 51% of this payload on prod: a workspace holds ~550 field objects and each repeats
// all 49 keys. Short codes are '$'-prefixed so they can never collide with a real key, which lets
// unmapped keys (a field added to the entity later) pass through untouched in both directions.
const SHORT_CODE_BY_KEY = {
  applicationId: '$0',
  applicationUniversalIdentifier: '$1',
  calendarEndViewIds: '$2',
  calendarEndViewUniversalIdentifiers: '$3',
  calendarViewIds: '$4',
  calendarViewUniversalIdentifiers: '$5',
  createdAt: '$6',
  defaultValue: '$7',
  description: '$8',
  fieldPermissionIds: '$9',
  fieldPermissionUniversalIdentifiers: '$a',
  icon: '$b',
  id: '$c',
  isActive: '$d',
  isLabelSyncedWithName: '$e',
  isNullable: '$f',
  isSystem: '$g',
  isSystemSideEffect: '$h',
  isUIEditable: '$i',
  isUIReadOnly: '$j',
  isUnique: '$k',
  kanbanAggregateOperationViewIds: '$l',
  kanbanAggregateOperationViewUniversalIdentifiers: '$m',
  label: '$n',
  mainGroupByFieldMetadataViewIds: '$o',
  mainGroupByFieldMetadataViewUniversalIdentifiers: '$p',
  morphId: '$q',
  name: '$r',
  objectMetadataId: '$s',
  objectMetadataUniversalIdentifier: '$t',
  options: '$u',
  overrides: '$v',
  relationTargetFieldMetadataId: '$w',
  relationTargetFieldMetadataUniversalIdentifier: '$x',
  relationTargetObjectMetadataId: '$y',
  relationTargetObjectMetadataUniversalIdentifier: '$z',
  searchFieldMetadataIds: '$A',
  searchFieldMetadataUniversalIdentifiers: '$B',
  settings: '$C',
  type: '$D',
  universalIdentifier: '$E',
  universalSettings: '$F',
  updatedAt: '$G',
  viewFieldIds: '$H',
  viewFieldUniversalIdentifiers: '$I',
  viewFilterIds: '$J',
  viewFilterUniversalIdentifiers: '$K',
  viewSortIds: '$L',
  viewSortUniversalIdentifiers: '$M',
  workspaceId: '$N',
} as const satisfies Record<string, string>;

// Default to [] in fromFieldMetadataEntityToFlatFieldMetadata and are empty for most fields, so the
// entry is dropped entirely on the wire and restored on decode.
const EMPTY_ARRAY_KEYS = [
  'kanbanAggregateOperationViewIds',
  'calendarViewIds',
  'calendarEndViewIds',
  'mainGroupByFieldMetadataViewIds',
  'viewFieldIds',
  'viewFilterIds',
  'fieldPermissionIds',
  'viewFieldUniversalIdentifiers',
  'viewFilterUniversalIdentifiers',
  'kanbanAggregateOperationViewUniversalIdentifiers',
  'calendarViewUniversalIdentifiers',
  'calendarEndViewUniversalIdentifiers',
  'mainGroupByFieldMetadataViewUniversalIdentifiers',
  'viewSortIds',
  'viewSortUniversalIdentifiers',
  'searchFieldMetadataIds',
  'searchFieldMetadataUniversalIdentifiers',
  'fieldPermissionUniversalIdentifiers',
] as const satisfies readonly (keyof typeof SHORT_CODE_BY_KEY)[];

const EMPTY_ARRAY_KEY_SET: ReadonlySet<string> = new Set(EMPTY_ARRAY_KEYS);

const KEY_BY_SHORT_CODE = new Map<string, string>(
  Object.entries(SHORT_CODE_BY_KEY).map(([key, shortCode]) => [shortCode, key]),
);

export type EncodedFlatFieldMetadataMaps = {
  byUniversalIdentifier: Record<string, Record<string, unknown>>;
  universalIdentifierById: FlatEntityMaps<FlatFieldMetadata>['universalIdentifierById'];
  universalIdentifiersByApplicationId: FlatEntityMaps<FlatFieldMetadata>['universalIdentifiersByApplicationId'];
};

const encodeFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): Record<string, unknown> => {
  const encoded: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flatFieldMetadata)) {
    if (
      EMPTY_ARRAY_KEY_SET.has(key) &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      continue;
    }

    encoded[SHORT_CODE_BY_KEY[key as keyof typeof SHORT_CODE_BY_KEY] ?? key] =
      value;
  }

  return encoded;
};

const decodeFlatFieldMetadata = (
  encoded: Record<string, unknown>,
): FlatFieldMetadata => {
  const decoded: Record<string, unknown> = {};

  for (const key of EMPTY_ARRAY_KEYS) {
    decoded[key] = [];
  }

  for (const [shortCode, value] of Object.entries(encoded)) {
    decoded[KEY_BY_SHORT_CODE.get(shortCode) ?? shortCode] = value;
  }

  return decoded as FlatFieldMetadata;
};

// The flat field metadata map is by far the largest workspace cache payload (~1 MB serialized per
// workspace on prod), and a cache miss parses all of it synchronously on the event loop. Encoding
// is lossless for the shape consumers see: decode restores every omitted key to [].
export const encodeFlatFieldMetadataMapsForCache = (
  flatEntityMaps: FlatEntityMaps<FlatFieldMetadata>,
): EncodedFlatFieldMetadataMaps => {
  const byUniversalIdentifier: Record<string, Record<string, unknown>> = {};

  for (const [universalIdentifier, flatFieldMetadata] of Object.entries(
    flatEntityMaps.byUniversalIdentifier,
  )) {
    if (flatFieldMetadata === undefined) {
      continue;
    }

    byUniversalIdentifier[universalIdentifier] =
      encodeFlatFieldMetadata(flatFieldMetadata);
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: flatEntityMaps.universalIdentifierById,
    universalIdentifiersByApplicationId:
      flatEntityMaps.universalIdentifiersByApplicationId,
  };
};

export const decodeFlatFieldMetadataMapsFromCache = (
  encoded: EncodedFlatFieldMetadataMaps,
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: FlatEntityMaps<FlatFieldMetadata>['byUniversalIdentifier'] =
    {};

  for (const [universalIdentifier, encodedFlatFieldMetadata] of Object.entries(
    encoded.byUniversalIdentifier,
  )) {
    byUniversalIdentifier[universalIdentifier] = decodeFlatFieldMetadata(
      encodedFlatFieldMetadata,
    );
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: encoded.universalIdentifierById,
    universalIdentifiersByApplicationId:
      encoded.universalIdentifiersByApplicationId,
  };
};
