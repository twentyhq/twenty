import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import {
  UpdateRelationAction,
  WorkspaceMigrationRelationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-relation-action-v2';
import {
  getWorkspaceMigrationV2RelationCreateAction,
  getWorkspaceMigrationV2RelationDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-relation-actions';
import { compareFieldMetadataInputAndGetUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/workspace-migration-field-metadata-input-comparator.util';
import { UpdatedObjectMetadataFieldAndRelationMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

export const buildWorkspaceMigrationV2FieldActions = (
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
    const updateFieldActions = updatedRelationFieldMetadata
      .filter(({ to: toField }) => !isRelationFieldMetadataType(toField.type))
      .flatMap(({ from, to }) =>
        compareFieldMetadataInputAndGetUpdateFieldActions({
          from,
          to,
          objectMetadataInput,
        }),
      )
      .map<UpdateRelationAction>(() => ({
        type: 'update_relation',
        // TODO
      }));

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
