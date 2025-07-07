import { Injectable } from '@nestjs/common';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-field-and-relations-delete-created-updated-matrix.util';
import {
  DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';
import { buildWorkspaceMigrationV2RelationActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-relation-actions-builder';

export type UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher =
  DeletedCreatedUpdatedMatrix<WorkspaceMigrationObjectInput>;

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

    const updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix =
      computeUpdatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix(
        updatedObjectMetadata,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix,
      );

    const relationWorkspaceMigrationActions =
      buildWorkspaceMigrationV2RelationActions(
        updatedObjectMetadataFieldAndRelationDeletedCreatedUpdatedMatrix,
      );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...fieldWorkspaceMigrationActions,
        ...relationWorkspaceMigrationActions,
      ],
    };
  }
}
