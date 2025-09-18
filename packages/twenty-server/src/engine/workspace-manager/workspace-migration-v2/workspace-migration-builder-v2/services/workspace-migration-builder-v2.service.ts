import { Injectable } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';

import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-maps-to-flat-object-metadatas.util';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { CreatedDeletedUpdatedActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationObjectActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { computeUpdatedObjectMetadataDeletedCreatedUpdatedFieldMatrix } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/compute-updated-object-metadata-deleted-created-updated-field-matrix.util';

export type WorkspaceMigrationV2BuilderOptions = {
  inferDeletionFromMissingEntities: boolean;
  isSystemBuild: boolean;
};

export type SuccessfulWorkspaceMigrationBuildResult = {
  status: 'success';
  objectActions: CreatedDeletedUpdatedActions<WorkspaceMigrationObjectActionV2>;
  fieldsActions: CreatedDeletedUpdatedActions<WorkspaceMigrationFieldActionV2>;
  optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};

export type FailedWorkspaceMigrationBuildResult = {
  status: 'fail';
  optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  errors: FailedFlatEntityValidation<FlatEntity>[];
};

export type WorkspaceMigrationBuildArgs = {
  buildOptions: WorkspaceMigrationV2BuilderOptions;
} & FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>;
// TODO deprecate this file
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor(
    private readonly workspaceMigrationV2ObjectActionsBuilderService: WorkspaceMigrationV2ObjectActionsBuilderService,
    private readonly workspaceMigrationV2FieldActionsBuilderService: WorkspaceMigrationV2FieldActionsBuilderService,
  ) {}

  public async validateAndBuild({
    fromFlatObjectMetadataMaps,
    toFlatObjectMetadataMaps,
    buildOptions,
  }: WorkspaceMigrationBuildArgs): Promise<
    | FailedWorkspaceMigrationBuildResult
    | SuccessfulWorkspaceMigrationBuildResult
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

    const allValidateAndBuildResultFailures = [
      ...objectActionsValidateAndBuildResult.failed,
      ...fieldActionsValidateAndBuildResult.failed,
    ];

    if (allValidateAndBuildResultFailures.length > 0) {
      return {
        status: 'fail',
        errors: allValidateAndBuildResultFailures,
        optimisticFlatObjectMetadataMaps:
          fieldActionsValidateAndBuildResult.optimisticFlatObjectMetadataMaps,
      };
    }

    return {
      status: 'success',
      fieldsActions: {
        created: fieldActionsValidateAndBuildResult.updated,
        deleted: fieldActionsValidateAndBuildResult.deleted,
        updated: fieldActionsValidateAndBuildResult.updated,
      },
      objectActions: {
        created: objectActionsValidateAndBuildResult.created,
        deleted: objectActionsValidateAndBuildResult.deleted,
        updated: objectActionsValidateAndBuildResult.updated,
      },
      optimisticFlatObjectMetadataMaps:
        fieldActionsValidateAndBuildResult.optimisticFlatObjectMetadataMaps,
    };
  }
}
