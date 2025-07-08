import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-input';

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
] as const satisfies (keyof WorkspaceMigrationObjectInput)[];
export type ObjectMetadataEntityEditableProperties =
  (typeof objectMetadataEntityEditableProperties)[number];

export type WorkspaceMigrationObjectInput = Partial<
  Omit<ObjectMetadataEntity, 'fields' | 'indexMetadatas'>
> & {
  uniqueIdentifier: string;
  flattenedIndexMetadatas: FlattenedIndexMetadata[];
  fieldInputs: WorkspaceMigrationFieldInput[];
};

export type WorkspaceMigrationObjectWithoutFields = Omit<
  WorkspaceMigrationObjectInput,
  'fieldInputs'
>;
