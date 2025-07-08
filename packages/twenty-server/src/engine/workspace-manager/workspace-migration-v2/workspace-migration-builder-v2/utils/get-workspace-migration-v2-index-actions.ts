import {
  CreateIndexAction,
  DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-action-v2';
import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-input';

export const getWorkspaceMigrationV2CreateIndexAction = (
  flattenedIndexMetadata: FlattenedIndexMetadata,
): CreateIndexAction => ({
  type: 'create_index',
  flattenedIndexMetadata,
});

export const getWorkspaceMigrationV2DeleteIndexAction = (
  flattenedIndexMetadata: FlattenedIndexMetadata,
): DeleteIndexAction => ({
  type: 'delete_index',
  flattenedIndexMetadata,
});
