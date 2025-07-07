import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';

export const objectMetadataEntityEditableProperties = [
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'labelPlural',
  'labelSingular',
  'namePlural',
  'nameSingular',
  'standardOverrides', // Only if standard
] as const satisfies (keyof ObjectMetadataEntity)[];
export type ObjectMetadataEntityEditableProperties =
  (typeof objectMetadataEntityEditableProperties)[number];

export type WorkspaceMigrationObjectInput = Partial<
  Omit<ObjectMetadataEntity, 'fields'>
> & {
  uniqueIdentifier: string;
  fieldInputs: WorkspaceMigrationFieldInput[];
};

export type WorkspaceMigrationObjectWithoutFields = Omit<
  WorkspaceMigrationObjectInput,
  'fieldInputs'
>;
