import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Relation and universal-identifier properties that only metadata-mutation, migration and
// view-resolution code reads — never the record query/execution path. They are the bulk of a
// field's serialized weight (view/filter/sort/search/permission id arrays, each doubled by a
// universal-identifier twin, plus universalSettings). Dropping them yields the lite projection
// the ORM context holds live on every request.
export const LITE_FLAT_FIELD_METADATA_EXCLUDED_KEYS = [
  'viewFieldIds',
  'viewFieldUniversalIdentifiers',
  'viewFilterIds',
  'viewFilterUniversalIdentifiers',
  'viewSortIds',
  'viewSortUniversalIdentifiers',
  'calendarViewIds',
  'calendarViewUniversalIdentifiers',
  'calendarEndViewIds',
  'calendarEndViewUniversalIdentifiers',
  'kanbanAggregateOperationViewIds',
  'kanbanAggregateOperationViewUniversalIdentifiers',
  'mainGroupByFieldMetadataViewIds',
  'mainGroupByFieldMetadataViewUniversalIdentifiers',
  'searchFieldMetadataIds',
  'searchFieldMetadataUniversalIdentifiers',
  'fieldPermissionIds',
  'fieldPermissionUniversalIdentifiers',
  'universalSettings',
  'relationTargetFieldMetadataUniversalIdentifier',
  'relationTargetObjectMetadataUniversalIdentifier',
  'objectMetadataUniversalIdentifier',
  'applicationUniversalIdentifier',
] as const satisfies readonly (keyof FlatFieldMetadata)[];

export type LiteFlatFieldMetadataExcludedKey =
  (typeof LITE_FLAT_FIELD_METADATA_EXCLUDED_KEYS)[number];

// The subset of FlatFieldMetadata the record query/execution path (ORM query build, GraphQL/REST
// record resolvers, RLS filtering) actually reads. Typed as an Omit so any hot-path read of a
// dropped property fails to compile rather than silently reading undefined.
export type LiteFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Omit<FlatFieldMetadata<T>, LiteFlatFieldMetadataExcludedKey>;
