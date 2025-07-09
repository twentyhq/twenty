import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';

export type CreateIndexAction = {
  type: 'create_index';
  flattenIndexMetadata: FlattenIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flattenIndexMetadata: FlattenIndexMetadata;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
