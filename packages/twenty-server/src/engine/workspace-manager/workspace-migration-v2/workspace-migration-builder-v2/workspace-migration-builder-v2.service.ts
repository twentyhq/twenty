import { Injectable } from '@nestjs/common';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import {
  WorkspaceMigrationObjectInput,
  WorkspaceMigrationObjectWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import {
  CustomDeletedCreatedUpdatedMatrix,
  DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

const separateRelationFieldMetadata = (
  fieldMetadataInputs: WorkspaceMigrationFieldInput[],
) => {
  const initialAcc: {
    relationFields: WorkspaceMigrationFieldInput[];
    otherFields: WorkspaceMigrationFieldInput[];
  } = {
    relationFields: [],
    otherFields: [],
  };
  return fieldMetadataInputs.reduce((acc, fieldMetadataInput) => {
    if (isRelationFieldMetadataType(fieldMetadataInput.type)) {
      return {
        ...acc,
        relationFields: [...acc.relationFields, fieldMetadataInput],
      };
    }

    return {
      ...acc,
      otherFields: [...acc.otherFields, fieldMetadataInput],
    };
  }, initialAcc);
};

export type UpdatedObjectMetadataFieldAndRelationMatrix = {
  objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
} & CustomDeletedCreatedUpdatedMatrix<
  'fieldMetadata',
  WorkspaceMigrationFieldInput
> &
  CustomDeletedCreatedUpdatedMatrix<
    'relationFieldMetadata',
    WorkspaceMigrationFieldInput
  >;

const computeUpdatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix =
  (
    updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updated'],
  ): UpdatedObjectMetadataFieldAndRelationMatrix[] => {
    const matriceAccumulator: UpdatedObjectMetadataFieldAndRelationMatrix[] =
      [];

    for (const { from, to } of updatedObjectMetadata) {
      const [
        { otherFields: fromOtherFields, relationFields: fromRelationFields },
        { otherFields: toOtherFields, relationFields: toRelationFields },
      ] = [from.fieldInputs, to.fieldInputs].map(separateRelationFieldMetadata);

      const fieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher({
        from: fromOtherFields,
        to: toOtherFields,
      });

      const relationFieldMetadataMatrix = deletedCreatedUpdatedMatrixDispatcher(
        {
          from: fromRelationFields,
          to: toRelationFields,
        },
      );

      matriceAccumulator.push({
        objectMetadataInput: to,
        createdFieldMetadata: fieldMetadataMatrix.created,
        deletedFieldMetadata: fieldMetadataMatrix.deleted,
        updatedFieldMetadata: fieldMetadataMatrix.updated,
        createdRelationFieldMetadata: relationFieldMetadataMatrix.created,
        deletedRelationFieldMetadata: relationFieldMetadataMatrix.deleted,
        updatedRelationFieldMetadata: relationFieldMetadataMatrix.updated,
      });
    }

    return matriceAccumulator;
  };

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};
export type UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher =
  DeletedCreatedUpdatedMatrix<WorkspaceMigrationObjectInput>;

@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    objectMetadataFromToInputs: WorkspaceMigrationBuilderV2ServiceArgs,
  ): WorkspaceMigrationV2 {
    const {
      created: createdObjectMetadata,
      deleted: deletedObjectMetadata,
      updated: updatedObjectMetadata,
    } = deletedCreatedUpdatedMatrixDispatcher(objectMetadataFromToInputs);

    const objectWorkspaceMigrationActions =
      buildWorkspaceMigrationV2ObjectActions({
        createdObjectMetadata,
        deletedObjectMetadata,
        updatedObjectMetadata,
      });

    const updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix =
      computeUpdatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix(
        updatedObjectMetadata,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix,
      );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...fieldWorkspaceMigrationActions,
      ],
    };
  }
}
