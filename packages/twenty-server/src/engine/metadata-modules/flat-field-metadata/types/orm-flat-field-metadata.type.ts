import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const ORM_FLAT_FIELD_METADATA_EXCLUDED_KEYS = [
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

export type OrmFlatFieldMetadataExcludedKey =
  (typeof ORM_FLAT_FIELD_METADATA_EXCLUDED_KEYS)[number];

export type OrmFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Omit<FlatFieldMetadata<T>, OrmFlatFieldMetadataExcludedKey>;
