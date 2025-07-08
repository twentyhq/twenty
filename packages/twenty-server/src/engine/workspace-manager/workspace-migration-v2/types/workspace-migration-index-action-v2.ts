import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-input';

export type CreateIndexAction = {
  type: 'create_index';
  flattenedIndexMetadata: FlattenedIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flattenedIndexMetadata: FlattenedIndexMetadata;
};

export type UpdateIndexAction = {
  type: 'udpate_index';
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction
  | UpdateIndexAction;
