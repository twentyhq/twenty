import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import {
  matrixMapDispatcher,
  MatrixMapDispatcherResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/matrix-map-dispatcher.util';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};

export type UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher =
  MatrixMapDispatcherResult<WorkspaceMigrationObjectInput>;

@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    objectMetadataFromToInputs: WorkspaceMigrationBuilderV2ServiceArgs,
  ): WorkspaceMigrationV2 {
    // This method should instantiate only migration and push actions accordingly in it.
    const {
      created: createdObjectMetadata,
      deleted: deletedObjectMetadata,
      updated: updatedObjectMetadata,
    } = matrixMapDispatcher({
      from: objectMetadataFromToInputs.from,
      to: objectMetadataFromToInputs.to,
    });

    const objectWorkspaceMigrationActions =
      buildWorkspaceMigrationV2ObjectActions({
        created: objectMetadataCreatedUpdatedDeletedMatrice.created,
        deleted: objectMetadataCreatedUpdatedDeletedMatrice.deleted,
        updated: objectMetadataCreatedUpdatedDeletedMatrice.updated,
      });

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        objectMetadataCreatedUpdatedDeletedMatrice.updated,
      );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...fieldWorkspaceMigrationActions,
      ],
    };
  }
}
