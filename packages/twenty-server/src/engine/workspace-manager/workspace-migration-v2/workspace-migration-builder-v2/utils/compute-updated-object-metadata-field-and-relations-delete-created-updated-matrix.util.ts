import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { WorkspaceMigrationObjectWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import {
  CustomDeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

export type UpdatedObjectMetadataFieldAndRelationMatrix = {
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<
  'fieldMetadata',
  WorkspaceMigrationFieldInput
>;

export const computeUpdatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix =
  (
    updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updated'],
  ): UpdatedObjectMetadataFieldAndRelationMatrix[] => {
    const matriceAccumulator: UpdatedObjectMetadataFieldAndRelationMatrix[] =
      [];

    for (const { from, to } of updatedObjectMetadata) {
      const fieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
        from: from.fieldInputs,
        to: to.fieldInputs,
      });

      matriceAccumulator.push({
        objectMetadataInput: to,
        createdFieldMetadata: fieldMetadataMatrix.created,
        deletedFieldMetadata: fieldMetadataMatrix.deleted,
        updatedFieldMetadata: fieldMetadataMatrix.updated,
      });
    }

    return matriceAccumulator;
  };
