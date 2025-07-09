import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlattenObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlattenFieldMetadataPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-field-metadata-comparator.util';

export type FieldAndObjectMetadataWorkspaceMigrationInput = {
  flattenFieldMetadata: FlattenFieldMetadata;
  flattenObjectMetadata: FlattenObjectMetadataWithoutFields;
};
export type CreateFieldAction = {
  type: 'create_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type UpdateFieldAction = {
  type: 'update_field';
  updates: Partial<
    {
      [P in FlattenFieldMetadataPropertiesToCompare]: {
        property: P;
      } & FromTo<FieldMetadataEntity[P]>;
    }[FlattenFieldMetadataPropertiesToCompare]
  >[];
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type DeleteFieldAction = {
  type: 'delete_field';
} & FieldAndObjectMetadataWorkspaceMigrationInput;

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;
