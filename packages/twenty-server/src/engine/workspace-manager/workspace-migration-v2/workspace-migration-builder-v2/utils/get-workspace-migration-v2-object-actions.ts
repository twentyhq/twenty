import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { CreateObjectAction, DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  input: WorkspaceMigrationObjectInput,
): CreateObjectAction => ({
  type: 'create_object',
  objectMetadataUniqueIdentifier: input.uniqueIdentifier,
  object: input as unknown as ObjectMetadataEntity, // TODO prastoin
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  input: WorkspaceMigrationObjectInput,
): DeleteObjectAction => ({
  type: 'delete_object',
  objectMetadataUniqueIdentifier: input.uniqueIdentifier,
});
