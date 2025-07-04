import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  input: WorkspaceMigrationObjectInput,
): CreateObjectAction => ({
  type: 'create_object',
  objectUniqueIdentifier: input.uniqueIdentifier,
  object: input as any, // TODO,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  input: WorkspaceMigrationObjectInput,
): DeleteObjectAction => ({
  type: 'delete_object',
  objectUniqueIdentifier: input.uniqueIdentifier,
});
