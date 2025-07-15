import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import {
  CreateIndexAction,
  DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';

export const getWorkspaceMigrationV2CreateIndexAction = (
  flatIndexMetadata: FlatIndexMetadata,
): CreateIndexAction => ({
  type: 'create_index',
  flatIndexMetadata,
});

export const getWorkspaceMigrationV2DeleteIndexAction = (
  flatIndexMetadata: FlatIndexMetadata,
): DeleteIndexAction => ({
  type: 'delete_index',
  flatIndexMetadata,
});
