import { FlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';
import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  flattenObjectMetadata: FlattenObjectMetadata,
): CreateObjectAction => ({
  type: 'create_object',
  flattenObjectMetadata,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  flattenObjectMetadata: FlattenObjectMetadata,
): DeleteObjectAction => ({
  type: 'delete_object',
  flattenObjectMetadata,
});
