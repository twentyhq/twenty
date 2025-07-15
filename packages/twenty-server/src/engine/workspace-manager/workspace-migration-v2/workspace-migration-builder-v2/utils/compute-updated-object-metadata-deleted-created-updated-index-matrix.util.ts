import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix = {
  flatObjectMetadata: FlatObjectMetadataWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<'indexMetadata', FlatIndexMetadata>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix = (
  updatedObjectMetadata: FromTo<FlatObjectMetadata>[],
): UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[] => {
  const matrixAccumulator: UpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix[] =
    [];

  for (const { from, to } of updatedObjectMetadata) {
    const indexMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
      from: from.flatIndexMetadatas,
      to: to.flatIndexMetadatas,
    });

    matrixAccumulator.push({
      flatObjectMetadata: to,
      createdIndexMetadata: indexMetadataMatrix.created,
      deletedIndexMetadata: indexMetadataMatrix.deleted,
      updatedIndexMetadata: indexMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
