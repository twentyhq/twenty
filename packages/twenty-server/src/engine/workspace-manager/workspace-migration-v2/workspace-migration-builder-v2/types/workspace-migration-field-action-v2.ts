import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldMetadataPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-field-metadata-property-update.type';

export type CreateFieldAction = {
  type: 'create_field';
  flatFieldMetadata: FlatFieldMetadata;
};

export type UpdateFieldAction = {
  type: 'update_field';
  workspaceId: string;
  fieldMetadataId: string;
  objectMetadataId: string;
  updates: Array<
    {
      [P in FlatFieldMetadataPropertiesToCompare]: FlatFieldMetadataPropertyUpdate<P>;
    }[FlatFieldMetadataPropertiesToCompare]
  >;
};

export type DeleteFieldAction = {
  type: 'delete_field';
  fieldMetadataId: string;
  objectMetadataId: string;
};

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;

export type WorkspaceMigrationFieldActionTypeV2 =
  WorkspaceMigrationFieldActionV2['type'];
