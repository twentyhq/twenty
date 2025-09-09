import { type WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';

type BuildWorkspaceMigrationIndexFieldActionsArgs = {
  objectMetadataDeletedCreatedUpdatedIndex: UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[];
  inferDeletionFromMissingObjectFieldIndex: boolean;
};
export const buildWorkspaceMigrationIndexFieldActions = ({
  inferDeletionFromMissingObjectFieldIndex,
  objectMetadataDeletedCreatedUpdatedIndex,
}: BuildWorkspaceMigrationIndexFieldActionsArgs): WorkspaceMigrationIndexActionV2[] => {
  return [];
};
