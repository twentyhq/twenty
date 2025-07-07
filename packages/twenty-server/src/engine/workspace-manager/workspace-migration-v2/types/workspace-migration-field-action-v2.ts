import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import {
  FieldMetadataEntityEditableProperties,
  WorkspaceMigrationFieldInput,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { WorkspaceMigrationObjectWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

export type FieldAndObjectMetadataWorkspaceMigrationInput = {
  fieldMetadataInput: WorkspaceMigrationFieldInput;
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
};
export type CreateFieldAction = {
  type: 'create_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type UpdateFieldAction = {
  type: 'update_field';
  updates: {
    [P in FieldMetadataEntityEditableProperties]: {
      property: P;
    } & FromTo<FieldMetadataEntity[P]>;
  }[FieldMetadataEntityEditableProperties][];
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type DeleteFieldAction = {
  type: 'delete_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;
