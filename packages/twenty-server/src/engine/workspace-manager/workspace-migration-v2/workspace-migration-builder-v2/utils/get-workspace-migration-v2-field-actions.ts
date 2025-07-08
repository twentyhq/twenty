import {
  CreateFieldAction,
  DeleteFieldAction,
  FieldAndObjectMetadataWorkspaceMigrationInput,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';

export const getWorkspaceMigrationV2FieldCreateAction = ({
  fieldMetadataInput,
  flattenObjectMetadata,
}: FieldAndObjectMetadataWorkspaceMigrationInput): CreateFieldAction => ({
  type: 'create_field',
  fieldMetadataInput,
  flattenObjectMetadata,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  fieldMetadataInput,
  flattenObjectMetadata,
}: FieldAndObjectMetadataWorkspaceMigrationInput): DeleteFieldAction => ({
  type: 'delete_field',
  fieldMetadataInput,
  flattenObjectMetadata,
});
