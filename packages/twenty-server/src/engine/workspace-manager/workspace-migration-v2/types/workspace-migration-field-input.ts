import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const fieldMetadataEntityPropertiesToCompare = [
  'defaultValue',
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'isUnique',
  'label',
  'name',
  'options',
  'relationTargetFieldMetadata',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadata',
  'relationTargetObjectMetadataId',
  'settings',
  'standardOverrides',
  'type',
] as const satisfies (keyof FieldMetadataEntity)[];
type FieldMetadataEntityPropertiesToCompare = typeof fieldMetadataEntityPropertiesToCompare[number];

export type WorkspaceMigrationObjectFieldInput = Pick<
  FieldMetadataEntity,
  FieldMetadataEntityPropertiesToCompare
> & {
  uniqueIdentifier: string
}