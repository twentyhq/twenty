import { Injectable } from '@nestjs/common';

import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';
import { getWorkspaceMigrationV2FieldCreateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { getWorkspaceMigrationV2CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationIndexActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-index-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    objectMetadataFromToInputs: FromTo<FlatObjectMetadata[]>,
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
      createdObjectMetadata.flatMap((flatObjectMetadata) =>
        flatObjectMetadata.flatFieldMetadatas.map((flatFieldMetadata) =>
          getWorkspaceMigrationV2FieldCreateAction({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
        ),
      );

    const createdObjectMetadataCreateIndexActions =
      createdObjectMetadata.flatMap((objectMetadata) =>
        objectMetadata.flatIndexMetadatas.map(
          getWorkspaceMigrationV2CreateIndexAction,
        ),
      );

    const updatedObjectMetadataDeletedCreatedUpdatedFieldMatrix =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix(
        updatedObjectMetadata,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        updatedObjectMetadataDeletedCreatedUpdatedFieldMatrix,
      );

    const updatedObjectMetadataIndexDeletedCreatedUpdatedMatrix =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix(
        updatedObjectMetadata,
      );
    const indexWorkspaceMigrationActions = buildWorkspaceMigrationIndexActions(
      updatedObjectMetadataIndexDeletedCreatedUpdatedMatrix,
    );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...createdObjectWorkspaceMigrationCreateFieldActions,
        ...createdObjectMetadataCreateIndexActions,
        ...fieldWorkspaceMigrationActions,
        ...indexWorkspaceMigrationActions,
      ],
    };
  }
}
