import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-field-metadata-comparator.util';

export type FieldAndObjectMetadataWorkspaceMigrationInput = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadataWithoutFields;
};
export type CreateFieldAction = {
  type: 'create_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type UpdateFieldAction = {
  type: 'update_field';
  updates: Partial<
    {
      [P in FlatFieldMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<FieldMetadataEntity[P]>;
    }[FlatFieldMetadataPropertiesToCompare]
  >[];
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type DeleteFieldAction = {
  type: 'delete_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;
