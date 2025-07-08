import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flattened-index-metadata';

export type CreateIndexAction = {
  type: 'create_index';
  flattenedIndexMetadata: FlattenedIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flattenedIndexMetadata: FlattenedIndexMetadata;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
