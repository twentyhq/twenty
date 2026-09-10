import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const ORM_FLAT_FIELD_METADATA_KEYS = [
  'id',
  'universalIdentifier',
  'applicationId',
  'workspaceId',
  'objectMetadataId',
  'type',
  'name',
  'label',
  'defaultValue',
  'options',
  'settings',
  'isNullable',
  'isUnique',
  'writability',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadataId',
  'morphId',
  // Read by the shared query runners (merge, create, group-by support gates)
  // and REST/direct-execution paths that also consume this projection.
  'isActive',
  'isSystem',
] as const satisfies readonly (keyof FlatFieldMetadata)[];

export type OrmFlatFieldMetadataKey =
  (typeof ORM_FLAT_FIELD_METADATA_KEYS)[number];

export type OrmFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Pick<
  FlatFieldMetadata<T>,
  Extract<keyof FlatFieldMetadata<T>, OrmFlatFieldMetadataKey>
>;
