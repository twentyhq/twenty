import { FlatIndexFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata-properties-to-compare.type';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateIndexFieldAction = {
  type: 'create_index_field';
  flatIndexFieldMetadata: FlatIndexFieldMetadata;
};

export type DeleteIndexFieldAction = {
  type: 'delete_index_field';
  flatIndexFieldMetadataId: string;
};

export type UpdateIndexFieldAction = {
  type: 'update_index_field';
  flatIndexFieldMetadataId: string;
  updates: Array<
    {
      [P in FlatIndexFieldMetadataPropertiesToCompare]: PropertyUpdate<
        FlatIndexFieldMetadata,
        P
      >;
    }[FlatIndexFieldMetadataPropertiesToCompare]
  >;
};

export type WorkspaceMigrationIndexFieldActionV2 =
  | CreateIndexFieldAction
  | DeleteIndexFieldAction
  | UpdateIndexFieldAction;

export type WorkspaceMigrationIndexFieldActionTypeV2 =
  WorkspaceMigrationIndexFieldActionV2['type'];
