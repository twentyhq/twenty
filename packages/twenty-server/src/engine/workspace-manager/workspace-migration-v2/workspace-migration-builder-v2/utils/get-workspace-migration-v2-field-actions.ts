import {
  CreateFieldAction,
  DeleteFieldAction,
  FieldAndObjectMetadataWorkspaceMigrationInput,
  MinimalFlatFieldAndObjectMetadata,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

export const getWorkspaceMigrationV2FieldCreateAction = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: FieldAndObjectMetadataWorkspaceMigrationInput): CreateFieldAction => ({
  type: 'create_field',
  flatFieldMetadata,
  flatObjectMetadata,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: MinimalFlatFieldAndObjectMetadata): DeleteFieldAction => ({
  type: 'delete_field',
  flatFieldMetadata,
  flatObjectMetadata,
});
