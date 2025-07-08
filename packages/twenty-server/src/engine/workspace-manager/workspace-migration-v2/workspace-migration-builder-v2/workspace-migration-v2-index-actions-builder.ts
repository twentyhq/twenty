import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { CustomDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import {
  getWorkspaceMigrationV2CreateIndexAction,
  getWorkspaceMigrationV2DeleteIndexAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';

export type CreatedDeletedUpdatedObjectMetadataInputMatrix =
  CustomDeletedCreatedUpdatedMatrix<
    'objectMetadata',
    WorkspaceMigrationObjectInput
  >;
export const buildWorkspaceMigrationIndexActions = ({
  createdObjectMetadata,
  deletedObjectMetadata,
  updatedObjectMetadata,
}: CreatedDeletedUpdatedObjectMetadataInputMatrix): WorkspaceMigrationIndexActionV2[] => {
  const createdObjectMetadataCreateIndexActions = createdObjectMetadata.flatMap(
    (objectMetadata) =>
      objectMetadata.flattenedIndexMetadatas.map(
        getWorkspaceMigrationV2CreateIndexAction,
      ),
  );

  const deletedObjectMetadataDeleteIndexActions = deletedObjectMetadata.flatMap(
    (objectMetadata) =>
      objectMetadata.flattenedIndexMetadatas.map(
        getWorkspaceMigrationV2DeleteIndexAction,
      ),
  );

  return [
    ...createdObjectMetadataCreateIndexActions,
    ...deletedObjectMetadataDeleteIndexActions,
  ];
};
