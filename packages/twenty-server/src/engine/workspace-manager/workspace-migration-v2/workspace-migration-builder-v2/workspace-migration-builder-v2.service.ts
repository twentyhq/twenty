import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-maps-to-flat-object-metadatas.util';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';
import { getWorkspaceMigrationV2FieldDeleteAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { getWorkspaceMigrationV2CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationIndexActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-index-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';
export type WorkspaceMigrationBuildArgs = {
  workspaceId: string;
  inferDeletionFromMissingObjectFieldIndex?: boolean;
} & FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>;
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build({
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    workspaceId,
    inferDeletionFromMissingObjectFieldIndex = true,
  }: WorkspaceMigrationBuildArgs): WorkspaceMigrationV2 {
    const fromFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(
        fromFlatObjectMetadataMaps,
      );
    const toFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(toFlatObjectMetadataMaps);

    const {
      created: createdObjectMetadata,
      deleted: deletedObjectMetadata,
      updated: updatedObjectMetadata,
    } = deletedCreatedUpdatedMatrixDispatcher({
      from: fromFlatObjectMetadatas,
      to: toFlatObjectMetadatas,
    });

    const objectWorkspaceMigrationActions =
      buildWorkspaceMigrationV2ObjectActions({
        createdObjectMetadata,
        deletedObjectMetadata,
        updatedObjectMetadata,
        inferDeletionFromMissingObjectFieldIndex,
      });

    const createdObjectMetadataCreateIndexActions =
      createdObjectMetadata.flatMap((objectMetadata) =>
        objectMetadata.flatIndexMetadatas.map(
          getWorkspaceMigrationV2CreateIndexAction,
        ),
      );

    const deletedObjectWorkspaceMigrationDeleteFieldActions =
      inferDeletionFromMissingObjectFieldIndex
        ? deletedObjectMetadata.flatMap((flatObjectMetadata) =>
            flatObjectMetadata.flatFieldMetadatas.map((flatFieldMetadata) =>
              getWorkspaceMigrationV2FieldDeleteAction({
                flatFieldMetadata,
                flatObjectMetadata,
              }),
            ),
          )
        : [];

    const objectMetadataDeletedCreatedUpdatedFields =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix(
        updatedObjectMetadata,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions({
        inferDeletionFromMissingObjectFieldIndex,
        objectMetadataDeletedCreatedUpdatedFields,
      });

    const objectMetadataDeletedCreatedUpdatedIndex =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix(
        updatedObjectMetadata,
      );
    const indexWorkspaceMigrationActions = buildWorkspaceMigrationIndexActions({
      objectMetadataDeletedCreatedUpdatedIndex,
      inferDeletionFromMissingObjectFieldIndex,
    });

    return {
      workspaceId,
      actions: [
        ...objectWorkspaceMigrationActions,
        ...deletedObjectWorkspaceMigrationDeleteFieldActions,
        ...createdObjectMetadataCreateIndexActions,
        ...fieldWorkspaceMigrationActions,
        ...indexWorkspaceMigrationActions,
      ],
    };
  }
}
