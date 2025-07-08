import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flattened-index-metadata';
import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';

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
