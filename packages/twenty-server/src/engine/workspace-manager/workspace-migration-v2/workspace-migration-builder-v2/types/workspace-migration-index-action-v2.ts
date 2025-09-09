import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properites-to-compare.type';
import { type FlatIndexMetadataPropertyUpdate } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-property-update.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

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
      [P in FlatIndexMetadataPropertiesToCompare]: FlatIndexMetadataPropertyUpdate<P>;
    }[FlatIndexMetadataPropertiesToCompare]
  >;
};

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;
// | UpdateIndexAction; // TODO incoming

export type WorkspaceMigrationIndexActionTypeV2 =
  WorkspaceMigrationIndexActionV2['type'];
