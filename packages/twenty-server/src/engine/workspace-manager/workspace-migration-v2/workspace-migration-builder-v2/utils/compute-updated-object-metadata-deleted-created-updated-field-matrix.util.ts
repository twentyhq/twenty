import { type FromTo } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = {
  flatObjectMetadata: FlatObjectMetadata;
} & CustomDeletedCreatedUpdatedMatrix<'flatFieldMetadatas', FlatFieldMetadata>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = (
  updatedObjectMetadata: FromTo<FlatObjectMetadata>[],
): UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] => {
  const matrixAccumulator: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] =
    [];

  for (const { from, to } of updatedObjectMetadata) {
    const fieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
      from: from.flatFieldMetadatas,
      to: to.flatFieldMetadatas,
    });

    matrixAccumulator.push({
      flatObjectMetadata: to,
      createdFlatFieldMetadatas: fieldMetadataMatrix.created,
      deletedFlatFieldMetadatas: fieldMetadataMatrix.deleted,
      updatedFlatFieldMetadatas: fieldMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
