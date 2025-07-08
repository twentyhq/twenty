import {
  UpdateFieldAction,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import { UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { compareFieldMetadataInputAndGetUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-field-metadata-input-comparator.util';

export const buildWorkspaceMigrationV2FieldActions = (
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[],
): WorkspaceMigrationFieldActionV2[] => {
  let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationFieldActionV2[] =
    [];

  for (const {
    createdFieldMetadata,
    deletedFieldMetadata,
    updatedFieldMetadata,
    objectMetadataInput,
  } of objectMetadataDeletedCreatedUpdatedFields) {
    const updateFieldActions = updatedFieldMetadata.flatMap<UpdateFieldAction>(
      ({ from, to }) => {
        const updates = compareFieldMetadataInputAndGetUpdateFieldActions({
          from,
          to,
        });

        if (updates.length === 0) {
          return [];
        }

        return {
          type: 'update_field',
          fieldMetadataInput: to,
          objectMetadataInput,
          updates,
        };
      },
    );

    const createFieldAction = createdFieldMetadata.map((fieldMetadataInput) =>
      getWorkspaceMigrationV2FieldCreateAction({
        fieldMetadataInput,
        objectMetadataInput,
      }),
    );

    const deleteFieldAction = deletedFieldMetadata.map((fieldMetadataInput) =>
      getWorkspaceMigrationV2FieldDeleteAction({
        fieldMetadataInput,
        objectMetadataInput,
      }),
    );

    allUpdatedObjectMetadataFieldActions =
      allUpdatedObjectMetadataFieldActions.concat([
        ...createFieldAction,
        ...deleteFieldAction,
        ...updateFieldActions,
      ]);
  }

  return allUpdatedObjectMetadataFieldActions;
};
