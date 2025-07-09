import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import {
  CreateIndexAction,
  DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';

export const getWorkspaceMigrationV2CreateIndexAction = (
  flattenIndexMetadata: FlatIndexMetadata,
): CreateIndexAction => ({
  type: 'create_index',
  flattenIndexMetadata,
});

export const getWorkspaceMigrationV2DeleteIndexAction = (
  flattenIndexMetadata: FlatIndexMetadata,
): DeleteIndexAction => ({
  type: 'delete_index',
  flattenIndexMetadata,
});
