import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import {
  UpdateFieldAction,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import {
  getWorkspaceMigrationV2FieldCreateAction,
  getWorkspaceMigrationV2FieldDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';

type BuildWorkspaceMigrationV2FieldActionsArgs = {
  inferDeletionFromMissingObjectFieldIndex: boolean;
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix[];
};
export const buildWorkspaceMigrationV2FieldActions = ({
  inferDeletionFromMissingObjectFieldIndex,
  objectMetadataDeletedCreatedUpdatedFields,
}: BuildWorkspaceMigrationV2FieldActionsArgs): WorkspaceMigrationFieldActionV2[] => {
  let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationFieldActionV2[] =
    [];

  for (const {
    createdFieldMetadata,
    deletedFieldMetadata,
    updatedFieldMetadata,
    flatObjectMetadata,
  } of objectMetadataDeletedCreatedUpdatedFields) {
    const updateFieldActions = updatedFieldMetadata.flatMap<UpdateFieldAction>(
      ({ from, to }) => {
        const updates = compareTwoFlatFieldMetadata({
          from,
          to,
        });

        if (updates.length === 0) {
          return [];
        }

        return {
          type: 'update_field',
          fieldMetadataId: to.id,
          objectMetadataId: to.objectMetadataId,
          workspaceId: to.workspaceId,
          updates,
        };
      },
    );

    const createFieldAction = createdFieldMetadata.map((flatFieldMetadata) =>
      getWorkspaceMigrationV2FieldCreateAction({
        flatFieldMetadata,
        flatObjectMetadata,
      }),
    );

    const deleteFieldAction = inferDeletionFromMissingObjectFieldIndex
      ? deletedFieldMetadata.map((flatFieldMetadata) =>
          getWorkspaceMigrationV2FieldDeleteAction({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
        )
      : [];

    allUpdatedObjectMetadataFieldActions =
      allUpdatedObjectMetadataFieldActions.concat([
        ...createFieldAction,
        ...deleteFieldAction,
        ...updateFieldActions,
      ]);
  }

  return allUpdatedObjectMetadataFieldActions;
};
