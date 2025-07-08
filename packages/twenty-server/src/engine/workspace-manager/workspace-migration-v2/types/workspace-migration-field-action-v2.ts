import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-field-metadata';
import { FlattenedObjectMetdataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { WorkspaceMigrationFieldInputPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/flatten-field-metadata-comparator.util';

export type FieldAndObjectMetadataWorkspaceMigrationInput = {
  fieldMetadataInput: FlattenFieldMetadata;
  objectMetadataInput: FlattenedObjectMetdataWithoutFields;
};
export type CreateFieldAction = {
  type: 'create_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type UpdateFieldAction = {
  type: 'update_field';
  updates: Partial<
    {
      [P in WorkspaceMigrationFieldInputPropertiesToCompare]: {
        property: P;
      } & FromTo<FieldMetadataEntity[P]>;
    }[WorkspaceMigrationFieldInputPropertiesToCompare]
  >[];
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type DeleteFieldAction = {
  type: 'delete_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;
