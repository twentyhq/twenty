import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { fromDeleteViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-delete-view-input-to-flat-view-or-throw.util';
import { fromDestroyViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-destroy-view-input-to-flat-view-or-throw.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import { DestroyViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/destroy-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewV2Service {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewInput,
    workspaceId,
    createdByUserWorkspaceId,
  }: {
    createViewInput: CreateViewInput;
    workspaceId: string;
    createdByUserWorkspaceId?: string;
  }): Promise<ViewDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatObjectMetadataMaps,
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const flatViewFromCreateInput = fromCreateViewInputToFlatViewToCreate({
      createViewInput,
      workspaceId,
      createdByUserWorkspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [flatViewFromCreateInput],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: flatObjectMetadataMaps,
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFromCreateInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async updateOne({
    updateViewInput,
    workspaceId,
    userWorkspaceId,
  }: {
    updateViewInput: UpdateViewInput;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatViewFromUpdateInput =
      fromUpdateViewInputToFlatViewToUpdateOrThrow({
        updateViewInput,
        flatViewMaps: existingFlatViewMaps,
      });

    const existingFlatView = existingFlatViewMaps.byId[updateViewInput.id];

    // If changing visibility from WORKSPACE to UNLISTED, ensure createdByUserWorkspaceId is set
    // This prevents the view from disappearing for the user making the change
    if (
      isDefined(existingFlatView) &&
      isDefined(updateViewInput.visibility) &&
      updateViewInput.visibility === 'UNLISTED' &&
      existingFlatView.visibility === 'WORKSPACE' &&
      isDefined(userWorkspaceId)
    ) {
      // Re-allocate the view to the current user
      flatViewFromUpdateInput.createdByUserWorkspaceId = userWorkspaceId;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatViewFromUpdateInput],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: updateViewInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async deleteOne({
    deleteViewInput,
    workspaceId,
  }: {
    deleteViewInput: DeleteViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewWithDeletedAt =
      fromDeleteViewInputToFlatViewOrThrow({
        deleteViewInput,
        flatViewMaps: existingFlatViewMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewWithDeletedAt],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: deleteViewInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async destroyOne({
    destroyViewInput,
    workspaceId,
  }: {
    destroyViewInput: DestroyViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatViewFromDestroyInput = fromDestroyViewInputToFlatViewOrThrow({
      destroyViewInput,
      flatViewMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [flatViewFromDestroyInput],
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              view: true,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view',
      );
    }

    return flatViewFromDestroyInput;
  }
}
