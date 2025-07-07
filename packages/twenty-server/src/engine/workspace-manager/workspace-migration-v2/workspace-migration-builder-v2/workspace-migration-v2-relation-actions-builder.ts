import {
  UpdateRelationAction,
  WorkspaceMigrationRelationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-relation-action-v2';
import { UpdatedObjectMetadataFieldAndRelationMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-field-and-relations-delete-created-updated-matrix.util';
import {
  getWorkspaceMigrationV2RelationCreateAction,
  getWorkspaceMigrationV2RelationDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-relation-actions';

export const buildWorkspaceMigrationV2RelationActions = (
  objectMetadataDeletedCreatedUpdatedFields: UpdatedObjectMetadataFieldAndRelationMatrix[],
): WorkspaceMigrationRelationActionV2[] => {
  let allUpdatedObjectMetadataFieldActions: WorkspaceMigrationRelationActionV2[] =
    [];

  for (const {
    createdRelationFieldMetadata,
    deletedRelationFieldMetadata,
    updatedRelationFieldMetadata,
    objectMetadataInput,
  } of objectMetadataDeletedCreatedUpdatedFields) {
    // make more readable
    const updateFieldActions: UpdateRelationAction[] =
      updatedRelationFieldMetadata();

    const createFieldAction = createdRelationFieldMetadata.map(
      (fieldMetadataInput) =>
        getWorkspaceMigrationV2RelationCreateAction({
          fieldMetadataInput,
          objectMetadataInput,
        }),
    );

    const deleteFieldAction = deletedRelationFieldMetadata.map(
      (fieldMetadataInput) =>
        getWorkspaceMigrationV2RelationDeleteAction({
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
