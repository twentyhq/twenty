import { FlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';
import {
  CreateObjectAction,
  DeleteObjectAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';

export const getWorkspaceMigrationV2ObjectCreateAction = (
  objectMetadataInput: FlattenObjectMetadata,
): CreateObjectAction => ({
  type: 'create_object',
  objectMetadataInput,
});

export const getWorkspaceMigrationV2ObjectDeleteAction = (
  objectMetadataInput: FlattenObjectMetadata,
): DeleteObjectAction => ({
  type: 'delete_object',
  objectMetadataInput,
});
