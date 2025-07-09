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
  flattenObjectMetadata: FlatObjectMetadataWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<'fieldMetadata', FlatFieldMetadata>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = (
  updatedObjectMetadata: FromTo<FlatObjectMetadata>[],
): UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] => {
  const matrixAccumulator: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] =
    [];

  for (const { from, to } of updatedObjectMetadata) {
    const fieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
      from: from.flattenFieldMetadatas,
      to: to.flattenFieldMetadatas,
    });

    matrixAccumulator.push({
      flattenObjectMetadata: to,
      createdFieldMetadata: fieldMetadataMatrix.created,
      deletedFieldMetadata: fieldMetadataMatrix.deleted,
      updatedFieldMetadata: fieldMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
