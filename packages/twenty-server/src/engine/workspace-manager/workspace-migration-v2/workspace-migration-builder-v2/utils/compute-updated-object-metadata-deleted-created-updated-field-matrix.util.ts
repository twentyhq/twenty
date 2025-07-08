import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-field-metadata';
import {
  FlattenObjectMetadata,
  FlattenedObjectMetdataWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = {
  objectMetadataInput: FlattenedObjectMetdataWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<'fieldMetadata', FlattenFieldMetadata>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = (
  updatedObjectMetadata: FromTo<FlattenObjectMetadata>[],
): UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] => {
  const matrixAccumulator: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[] =
    [];

  for (const { from, to } of updatedObjectMetadata) {
    const fieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
      from: from.fieldInputs,
      to: to.fieldInputs,
    });

    matrixAccumulator.push({
      objectMetadataInput: to,
      createdFieldMetadata: fieldMetadataMatrix.created,
      deletedFieldMetadata: fieldMetadataMatrix.deleted,
      updatedFieldMetadata: fieldMetadataMatrix.updated,
    });
  }

  return matrixAccumulator;
};
