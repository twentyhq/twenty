import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';

export type CreateIndexAction = {
  type: 'create_index';
  flattenIndexMetadata: FlatIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flattenIndexMetadata: FlatIndexMetadata;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
