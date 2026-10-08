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
  // read by the shared query runners and REST/direct-execution paths
  'isActive',
  'isSystem',
  // read by the timeline write path to drop non-audited fields
  'isAuditLogged',
] as const satisfies readonly (keyof FlatFieldMetadata)[];

export type OrmFlatFieldMetadataKey =
  (typeof ORM_FLAT_FIELD_METADATA_KEYS)[number];

export type OrmFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Pick<
  FlatFieldMetadata<T>,
  Extract<keyof FlatFieldMetadata<T>, OrmFlatFieldMetadataKey>
>;
