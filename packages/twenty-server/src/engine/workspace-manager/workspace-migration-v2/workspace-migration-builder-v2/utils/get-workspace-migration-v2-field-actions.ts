import {
  CreateFieldAction,
  DeleteFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

type FieldInputAndObjectUniqueIdentifier = {
  field: WorkspaceMigrationObjectFieldInput;
  objectMetadataUniqueIdentifier: string;
};
export const getWorkspaceMigrationV2FieldCreateAction = ({
  field,
  objectMetadataUniqueIdentifier,
}: FieldInputAndObjectUniqueIdentifier): CreateFieldAction => ({
  type: 'create_field',
  field: field as any, // TODO
  fieldUniqueIdentifier: field.uniqueIdentifier,
  objectUniqueIdentifier: objectMetadataUniqueIdentifier,
});

export const getWorkspaceMigrationV2FieldDeleteAction = ({
  field,
  objectMetadataUniqueIdentifier,
}: FieldInputAndObjectUniqueIdentifier): DeleteFieldAction => ({
  type: 'delete_field',
  fieldUniqueIdentifier: field.uniqueIdentifier,
  objectUniqueIdentifier: objectMetadataUniqueIdentifier,
});
