import {
  CreateFieldAction,
  DeleteFieldAction,
  FieldAndObjectMetadataWorkspaceMigrationInput,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';

export const getWorkspaceMigrationV2FieldCreateAction = ({
  fieldMetadataInput,
  objectMetadataInput,
}: FieldAndObjectMetadataWorkspaceMigrationInput): CreateFieldAction => ({
  type: 'create_field',
  fieldMetadataInput,
  objectMetadataInput,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  fieldMetadataInput,
  objectMetadataInput,
}: FieldAndObjectMetadataWorkspaceMigrationInput): DeleteFieldAction => ({
  type: 'delete_field',
  fieldMetadataInput,
  objectMetadataInput,
});
