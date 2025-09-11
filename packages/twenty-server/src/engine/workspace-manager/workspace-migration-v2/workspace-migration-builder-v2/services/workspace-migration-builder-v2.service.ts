import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { fromFlatObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-maps-to-flat-object-metadatas.util';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { buildWorkspaceMigrationIndexActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-index-matrix.util';
import { getWorkspaceMigrationV2CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-index-actions';

export type WorkspaceMigrationV2BuilderOptions = {
  inferDeletionFromMissingEntities: boolean;
  isSystemBuild: boolean;
};

type SuccessfulWorkspaceMigrationBuildResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
  optimisticFlatEntityMaps: FlatObjectMetadataMaps;
};

export type FailedWorkspaceMigrationBuildResult = {
  status: 'fail';
  errors: (
    | FailedFlatObjectMetadataValidation
    | FailedFlatFieldMetadataValidation
  )[];
};

export type WorkspaceMigrationBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
} & FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>;
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor(
    private readonly workspaceMigrationV2ObjectActionsBuilderService: WorkspaceMigrationV2ObjectActionsBuilderService,
    private readonly workspaceMigrationV2FieldActionsBuilderService: WorkspaceMigrationV2FieldActionsBuilderService,
  ) {}

  public async validateAndBuild({
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    workspaceId,
    buildOptions,
  }: WorkspaceMigrationBuildArgs): Promise<
    | SuccessfulWorkspaceMigrationBuildResult
    | FailedWorkspaceMigrationBuildResult
  > {
    const fromFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(
        fromFlatObjectMetadataMaps,
      );
    const toFlatObjectMetadatas =
      fromFlatObjectMetadataMapsToFlatObjectMetadatas(toFlatObjectMetadataMaps);

    // Dispatch
    const {
      created: createdFlatObjectMetadatas,
      deleted: deletedFlatObjectMetadatas,
      updated: updatedFlatObjectMetadatas,
    } = deletedCreatedUpdatedMatrixDispatcher({
      from: fromFlatObjectMetadatas,
      to: toFlatObjectMetadatas,
    });

    // Should be handled separately from objects
    const objectMetadataDeletedCreatedUpdatedIndex =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedIndexMatrix(
        updatedFlatObjectMetadatas,
      );

    // Should be handled separately from objects
    const objectMetadataDeletedCreatedUpdatedFields =
      computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix(
        updatedFlatObjectMetadatas,
      );
    ///

    // Validate and build
    const objectActionsValidateAndBuildResult =
      await this.workspaceMigrationV2ObjectActionsBuilderService.validateAndBuildObjectActions(
        {
          fromFlatObjectMetadataMaps,
          createdFlatObjectMetadatas,
          deletedFlatObjectMetadatas,
          toFlatObjectMetadataMaps,
          updatedFlatObjectMetadatas,
          buildOptions,
        },
      );

    const fieldActionsValidateAndBuildResult =
      await this.workspaceMigrationV2FieldActionsBuilderService.validateAndBuildFieldActions(
        {
          buildOptions,
          fromFlatObjectMetadataMaps:
            objectActionsValidateAndBuildResult.optimisticFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          objectMetadataDeletedCreatedUpdatedFields,
        },
      );

    const createdObjectMetadataCreateIndexActions =
      createdFlatObjectMetadatas.flatMap((objectMetadata) =>
        objectMetadata.flatIndexMetadatas.map(
          getWorkspaceMigrationV2CreateIndexAction,
        ),
      );

    const indexWorkspaceMigrationActions = buildWorkspaceMigrationIndexActions({
      objectMetadataDeletedCreatedUpdatedIndex,
      inferDeletionFromMissingObjectFieldIndex:
        buildOptions.inferDeletionFromMissingEntities,
    });

    const allValidateAndBuildResultFailures = [
      ...objectActionsValidateAndBuildResult.failed,
      ...fieldActionsValidateAndBuildResult.failed,
    ];

    if (allValidateAndBuildResultFailures.length > 0) {
      return {
        status: 'fail',
        errors: allValidateAndBuildResultFailures,
      };
    }

    return {
      status: 'success',
      workspaceMigration: {
        workspaceId,
        actions: [
          ...fieldActionsValidateAndBuildResult.deleted, // Should be handled separately from objects
          ...objectActionsValidateAndBuildResult.deleted,
          ...objectActionsValidateAndBuildResult.created,
          ...objectActionsValidateAndBuildResult.updated,
          ...fieldActionsValidateAndBuildResult.created, // Should be handled separately from objects
          ...fieldActionsValidateAndBuildResult.updated, // Should be handled separately from objects
          ...createdObjectMetadataCreateIndexActions,
          ...indexWorkspaceMigrationActions, // Should be handled separately from objects
        ],
      },
      optimisticFlatEntityMaps:
        fieldActionsValidateAndBuildResult.optimisticFlatObjectMetadataMaps,
    };
  }
}
