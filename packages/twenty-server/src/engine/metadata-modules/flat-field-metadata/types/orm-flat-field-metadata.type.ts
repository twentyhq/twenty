import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const ORM_FLAT_FIELD_METADATA_KEYS = [
  'id',
  'universalIdentifier',
  'workspaceId',
  'applicationId',
  'objectMetadataId',
  'type',
  'name',
  'label',
  'description',
  'icon',
  'defaultValue',
  'options',
  'settings',
  'overrides',
  'isActive',
  'isSystem',
  'isSystemSideEffect',
  'isUIEditable',
  'isNullable',
  'isUnique',
  'isLabelSyncedWithName',
  'writability',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadataId',
  'morphId',
  'createdAt',
  'updatedAt',
] as const satisfies readonly (keyof FlatFieldMetadata)[];

export type OrmFlatFieldMetadataKey =
  (typeof ORM_FLAT_FIELD_METADATA_KEYS)[number];

export type OrmFlatFieldMetadata = Pick<
  FlatFieldMetadata,
  OrmFlatFieldMetadataKey
>;
