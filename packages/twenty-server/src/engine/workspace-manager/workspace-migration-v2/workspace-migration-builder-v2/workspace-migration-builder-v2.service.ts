import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import {
  DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

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

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions({ updatedObjectMetadata });

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...fieldWorkspaceMigrationActions,
      ],
    };
  }
}
