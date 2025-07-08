import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { FlattenedIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-input';
import {
  WorkspaceMigrationObjectInput,
  WorkspaceMigrationObjectWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix = {
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<'indexMetadata', FlattenedIndexMetadata>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix = (
  updatedObjectMetadata: FromTo<WorkspaceMigrationObjectInput>[],
): UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[] => {
  const matrixAccumulator: UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[] =
    [];

  for (const { from, to } of updatedObjectMetadata) {
    const indexMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
      from: from.flattenedIndexMetadatas,
      to: to.flattenedIndexMetadatas,
    });

    matrixAccumulator.push({
      objectMetadataInput: to,
      createdIndexMetadata: indexMetadataMatrix.created,
      deletedIndexMetadata: indexMetadataMatrix.deleted,
      updatedIndexMetadata: indexMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
