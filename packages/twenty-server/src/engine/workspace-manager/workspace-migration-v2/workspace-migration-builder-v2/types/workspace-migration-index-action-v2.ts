import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export type CreateIndexAction = {
  type: 'create_index';
  flatIndexMetadata: FlatIndexMetadata;
};

export type DeleteIndexAction = {
  type: 'delete_index';
  flatIndexMetadataId: string;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;

export type WorkspaceMigrationIndexActionTypeV2 =
  WorkspaceMigrationIndexActionV2['type'];
