import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  objectMetadataInput: WorkspaceMigrationObjectInput,
): CreateObjectAction => ({
  type: 'create_object',
  objectMetadataInput,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  objectMetadataInput: WorkspaceMigrationObjectInput,
): DeleteObjectAction => ({
  type: 'delete_object',
  objectMetadataInput,
});
