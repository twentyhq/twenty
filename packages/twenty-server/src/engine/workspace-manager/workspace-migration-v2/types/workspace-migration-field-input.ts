import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fieldMetadataEntityEditableProperties = [
  'defaultValue',
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'isUnique',
  'label',
  'name',
  'options',
  'standardOverrides',
] as const satisfies (keyof WorkspaceMigrationFieldInput)[];
export type FieldMetadataEntityEditableProperties =
  (typeof fieldMetadataEntityEditableProperties)[number];

// TODO could describe required minimum keys
export type WorkspaceMigrationFieldInput = Partial<
  Omit<FieldMetadataEntity, 'object' | 'indexFieldMetadatas'>
> & {
  uniqueIdentifier: string;
};

export const fieldMetadataPropertiesToStringify = [
  'defaultValue',
  'standardOverrides',
] as const satisfies FieldMetadataEntityEditableProperties[];
