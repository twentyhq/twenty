import {
  CreateFieldAction,
  DeleteFieldAction,
  FieldAndObjectMetadataWorkspaceMigrationInput,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export const getWorkspaceMigrationV2FieldCreateAction = ({
  flattenFieldMetadata,
  flattenObjectMetadata,
}: FieldAndObjectMetadataWorkspaceMigrationInput): CreateFieldAction => ({
  type: 'create_field',
  flattenFieldMetadata,
  flattenObjectMetadata,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  flattenFieldMetadata,
  flattenObjectMetadata,
}: FieldAndObjectMetadataWorkspaceMigrationInput): DeleteFieldAction => ({
  type: 'delete_field',
  flattenFieldMetadata,
  flattenObjectMetadata,
});
