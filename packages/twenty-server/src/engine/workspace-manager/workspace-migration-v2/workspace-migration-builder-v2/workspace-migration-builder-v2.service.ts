import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-maps-to-flat-object-metadatas.util';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { FailedMetadataValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-metadata-validate-and-build.type';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';
import { getWorkspaceMigrationV2FieldDeleteAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-field-actions';
import { getWorkspaceMigrationV2CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationIndexActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-index-actions-builder';
import { WorkspaceMigrationV2ObjectActionsBuilder } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

export type WorkspaceMigrationV2BuilderOptions = {
  inferDeletionFromMissingObjectFieldIndex: boolean;
  isSystemBuild: boolean;
};

export type WorkspaceMigrationBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  // Could from be optional ? we still have a race condition when if we recompute cache it could have been different than when we calculated the to
} & FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>;
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor(
    private readonly workspaceMigrationV2ObjectActionsBuilder: WorkspaceMigrationV2ObjectActionsBuilder,
  ) {}

  public async validateAndBuild({
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    workspaceId,
    buildOptions,
  }: WorkspaceMigrationBuildArgs): Promise<
    | FailedMetadataValidateAndBuild
    | {
        status: 'success';
        workspaceMigration: WorkspaceMigrationV2;
      }
  > {
    const fromFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(
        fromFlatObjectMetadataMaps,
      );
    const toFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(toFlatObjectMetadataMaps);

    // Dispatch
    const {
      created: createdFlatObjectMetadata,
      deleted: deletedFlatObjectMetadata,
      updated: updatedFlatObjectMetadata,
    } = deletedCreatedUpdatedMatrixDispatcher({
      from: fromFlatObjectMetadatas,
      to: toFlatObjectMetadatas,
    });

    const objectMetadataDeletedCreatedUpdatedIndex =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix(
        updatedFlatObjectMetadata,
      );

    const objectMetadataDeletedCreatedUpdatedFields =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix(
        updatedFlatObjectMetadata,
      );
    ///

    // Validate and build
    const objectWorkspaceMigrationActions =
      await this.workspaceMigrationV2ObjectActionsBuilder.validateAndBuildObjectActions(
        {
          fromFlatObjectMetadataMaps,
          createdFlatObjectMetadata,
          deletedFlatObjectMetadata,
          toFlatObjectMetadataMaps,
          updatedFlatObjectMetadata,
          buildOptions,
        },
      );

    const createdObjectMetadataCreateIndexActions =
      createdFlatObjectMetadata.flatMap((objectMetadata) =>
        objectMetadata.flatIndexMetadatas.map(
          getWorkspaceMigrationV2CreateIndexAction,
        ),
      );

    const deletedObjectWorkspaceMigrationDeleteFieldActions =
      buildOptions.inferDeletionFromMissingObjectFieldIndex
        ? deletedFlatObjectMetadata.flatMap((flatObjectMetadata) =>
            flatObjectMetadata.flatFieldMetadatas.map((flatFieldMetadata) =>
              getWorkspaceMigrationV2FieldDeleteAction({
                flatFieldMetadata,
                flatObjectMetadata,
              }),
            ),
          )
        : [];

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions({
        inferDeletionFromMissingObjectFieldIndex:
          buildOptions.inferDeletionFromMissingObjectFieldIndex,
        objectMetadataDeletedCreatedUpdatedFields,
      });

    const indexWorkspaceMigrationActions = buildWorkspaceMigrationIndexActions({
      objectMetadataDeletedCreatedUpdatedIndex,
      inferDeletionFromMissingObjectFieldIndex:
        buildOptions.inferDeletionFromMissingObjectFieldIndex,
    });
    ///

    if (objectWorkspaceMigrationActions.results.failed.length > 0) {
      return {
        status: 'fail',
        errors: objectWorkspaceMigrationActions.results.failed.flatMap(
          (el) => el.errors,
        ),
      };
    }

    return {
      status: 'success',
      workspaceMigration: {
        workspaceId,
        actions: [
          ...deletedObjectWorkspaceMigrationDeleteFieldActions,
          ...objectWorkspaceMigrationActions.results.successful.map(
            (el) => el.result,
          ), // TMP create util
          ...createdObjectMetadataCreateIndexActions,
          ...fieldWorkspaceMigrationActions,
          ...indexWorkspaceMigrationActions,
        ],
      },
    };
  }
}
