import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  flatObjectMetadata: FlatObjectMetadata,
): CreateObjectAction => ({
  type: 'create_object',
  flatObjectMetadata,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  flatObjectMetadata: FlatObjectMetadata,
): DeleteObjectAction => ({
  type: 'delete_object',
  flatObjectMetadata,
});
