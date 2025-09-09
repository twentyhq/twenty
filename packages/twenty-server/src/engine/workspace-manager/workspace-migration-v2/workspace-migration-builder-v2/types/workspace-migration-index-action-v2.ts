import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properties-to-compare.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateIndexAction = {
  type: 'create_index';
  flatIndexMetadata: FlatIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flatIndexMetadataId: string;
};

export type UpdateIndexAction = {
  type: 'update_index';
  flatIndexMetadataId: string;
  updates: Array<
    {
      [P in FlatIndexMetadataPropertiesToCompare]: PropertyUpdate<
        FlatIndexMetadata,
        P
      >;
    }[FlatIndexMetadataPropertiesToCompare]
  >;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction
  // | UpdateIndexAction;

export type WorkspaceMigrationIndexActionTypeV2 =
  WorkspaceMigrationIndexActionV2['type'];
