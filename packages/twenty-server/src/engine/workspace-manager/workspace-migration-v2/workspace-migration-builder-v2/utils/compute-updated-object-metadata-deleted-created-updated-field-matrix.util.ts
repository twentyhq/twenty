import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = {
  flatObjectMetadata: FlatObjectMetadataWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<'fieldMetadata', FlatFieldMetadata>;

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
      createdFieldMetadata: fieldMetadataMatrix.created,
      deletedFieldMetadata: fieldMetadataMatrix.deleted,
      updatedFieldMetadata: fieldMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
