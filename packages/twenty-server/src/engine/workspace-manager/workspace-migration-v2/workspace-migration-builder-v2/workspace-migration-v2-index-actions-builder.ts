import { compareTwoFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/compare-two-flat-index-metadata.util';
import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';
import {
  getWorkspaceMigrationV2CreateIndexAction,
  getWorkspaceMigrationV2DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';

type BuildWorkspaceMigrationIndexActionsArgs = {
  objectMetadataDeletedCreatedUpdatedIndex: UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[];
  inferDeletionFromMissingObjectFieldIndex: boolean;
};
export const buildWorkspaceMigrationIndexActions = ({
  inferDeletionFromMissingObjectFieldIndex,
  objectMetadataDeletedCreatedUpdatedIndex,
}: BuildWorkspaceMigrationIndexActionsArgs): WorkspaceMigrationIndexActionV2[] => {
  let allUpdatedObjectMetadataIndexActions: WorkspaceMigrationIndexActionV2[] =
    [];

  for (const {
    createdIndexMetadata,
    deletedIndexMetadata,
    updatedIndexMetadata,
  } of objectMetadataDeletedCreatedUpdatedIndex) {
    const updatedDeleteAndCreateIndexActions =
      updatedIndexMetadata.flatMap<WorkspaceMigrationIndexActionV2>(
        ({ to, from }) => {
          const updates = compareTwoFlatIndexMetadata({ from, to });

          if (updates.length === 0) {
            return [];
          }

          return [
            getWorkspaceMigrationV2DeleteIndexAction(from),
            getWorkspaceMigrationV2CreateIndexAction(to),
          ];
        },
      );

    const createIndexActions = createdIndexMetadata.map(
      getWorkspaceMigrationV2CreateIndexAction,
    );
    const deleteIndexActions = inferDeletionFromMissingObjectFieldIndex
      ? deletedIndexMetadata.map(getWorkspaceMigrationV2DeleteIndexAction)
      : [];

    allUpdatedObjectMetadataIndexActions =
      allUpdatedObjectMetadataIndexActions.concat([
        ...createIndexActions,
        ...deleteIndexActions,
        ...updatedDeleteAndCreateIndexActions,
      ]);
  }

  return allUpdatedObjectMetadataIndexActions;
};
