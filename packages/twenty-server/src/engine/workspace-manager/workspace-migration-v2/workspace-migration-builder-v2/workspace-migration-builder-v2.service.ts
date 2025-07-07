import { Injectable } from '@nestjs/common';

import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    objectMetadataFromToInputs: FromTo<WorkspaceMigrationObjectInput[]>,
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

    const createdObjectWorkspaceMigrationCreateFieldActions =
      createdObjectMetadata.flatMap((objectMetadataInput) =>
        objectMetadataInput.fieldInputs.map((fieldMetadataInput) =>
          getWorkspaceMigrationV2FieldCreateAction({
            fieldMetadataInput,
            objectMetadataInput,
          }),
        ),
      );

    const updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix(
        updatedObjectMetadata,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix,
      );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...createdObjectWorkspaceMigrationCreateFieldActions,
        ...fieldWorkspaceMigrationActions,
      ],
    };
  }
}
