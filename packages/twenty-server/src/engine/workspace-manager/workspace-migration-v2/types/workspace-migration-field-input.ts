import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fieldMetadataEntityEditableProperties = [
  'defaultValue',
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'isUnique', // unsure
  'label',
  'name',
  'options',
  'relationTargetFieldMetadata',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadata',
  'relationTargetObjectMetadataId',
  'settings',
  'standardOverrides',
] as const satisfies (keyof FieldMetadataEntity)[];
export type FieldMetadataEntityEditableProperties =
  (typeof fieldMetadataEntityEditableProperties)[number];

// TOOD could describe required minimum keys
export type WorkspaceMigrationFieldInput = Partial<
  Omit<FieldMetadataEntity, 'object'>
> & {
  uniqueIdentifier: string;
};
