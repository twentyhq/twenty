import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';
import {
  CreateIndexAction,
  DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-action-v2';

export const getWorkspaceMigrationV2CreateIndexAction = (
  flattenedIndexMetadata: FlattenIndexMetadata,
): CreateIndexAction => ({
  type: 'create_index',
  flattenedIndexMetadata,
});

export const getWorkspaceMigrationV2DeleteIndexAction = (
  flattenedIndexMetadata: FlattenIndexMetadata,
): DeleteIndexAction => ({
  type: 'delete_index',
  flattenedIndexMetadata,
});
