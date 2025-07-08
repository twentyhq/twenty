import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import {
  WorkspaceMigrationObjectInput,
  WorkspaceMigrationObjectWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';

export type UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = {
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<
  'fieldMetadata',
  WorkspaceMigrationFieldInput
>;

export const computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix = (
  updatedObjectMetadata: FromTo<WorkspaceMigrationObjectInput>[],
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
