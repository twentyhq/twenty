import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { fromCreateViewGroupInputToFlatViewGroupToCreate } from 'src/engine/metadata-modules/flat-view-group/utils/from-create-view-group-input-to-flat-view-group-to-create.util';
import { fromDeleteViewGroupInputToFlatViewGroupOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-delete-view-group-input-to-flat-view-group-or-throw.util';
import { fromDestroyViewGroupInputToFlatViewGroupOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-destroy-view-group-input-to-flat-view-group-or-throw.util';
import { fromUpdateViewGroupInputToFlatViewGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-update-view-group-input-to-flat-view-group-to-update-or-throw.util';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import { DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewGroupV2Service {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createViewGroupInput,
    workspaceId,
  }: {
    createViewGroupInput: CreateViewGroupInput;
    workspaceId: string;
  }): Promise<ViewGroupDTO> {
    const {
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewGroupMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const flatViewGroupToCreate =
      fromCreateViewGroupInputToFlatViewGroupToCreate({
        createViewGroupInput,
        workspaceId,
      });

    const toFlatViewGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatViewGroupToCreate,
      flatEntityMaps: existingFlatViewGroupMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: {
              from: existingFlatViewGroupMaps,
              to: toFlatViewGroupMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view group',
      );
    }

    const { flatViewGroupMaps: recomputedExistingFlatViewGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewGroupMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewGroupToCreate.id,
      flatEntityMaps: recomputedExistingFlatViewGroupMaps,
    });
  }

  async updateOne({
    updateViewGroupInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewGroupInput: UpdateViewGroupInput;
  }): Promise<ViewGroupDTO> {
    const {
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewGroupMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewGroup =
      fromUpdateViewGroupInputToFlatViewGroupToUpdateOrThrow({
        flatViewGroupMaps: existingFlatViewGroupMaps,
        updateViewGroupInput,
      });

    const toFlatViewGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatViewGroup,
      flatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: {
              from: existingFlatViewGroupMaps,
              to: toFlatViewGroupMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps,
            flatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view group',
      );
    }

    const { flatViewGroupMaps: recomputedExistingFlatViewGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewGroupMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewGroup.id,
      flatEntityMaps: recomputedExistingFlatViewGroupMaps,
    });
  }

  async deleteOne({
    deleteViewGroupInput,
    workspaceId,
  }: {
    deleteViewGroupInput: DeleteViewGroupInput;
    workspaceId: string;
  }): Promise<ViewGroupDTO> {
    const {
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewGroupMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewGroupWithDeletedAt =
      fromDeleteViewGroupInputToFlatViewGroupOrThrow({
        flatViewGroupMaps: existingFlatViewGroupMaps,
        deleteViewGroupInput,
      });

    const toFlatViewGroupMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatViewGroupWithDeletedAt,
      flatEntityMaps: existingFlatViewGroupMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: {
              from: existingFlatViewGroupMaps,
              to: toFlatViewGroupMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view group',
      );
    }

    const { flatViewGroupMaps: recomputedExistingFlatViewGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewGroupMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewGroupWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatViewGroupMaps,
    });
  }

  async destroyOne({
    destroyViewGroupInput,
    workspaceId,
  }: {
    destroyViewGroupInput: DestroyViewGroupInput;
    workspaceId: string;
  }): Promise<ViewGroupDTO> {
    const {
      flatViewGroupMaps: existingFlatViewGroupMaps,
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewGroupMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const existingViewGroupToDelete =
      fromDestroyViewGroupInputToFlatViewGroupOrThrow({
        destroyViewGroupInput,
        flatViewGroupMaps: existingFlatViewGroupMaps,
      });

    const fromFlatViewGroupMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingViewGroupToDelete.id],
      flatEntityMaps: existingFlatViewGroupMaps,
    });
    const toFlatViewGroupMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: fromFlatViewGroupMaps,
      entityToDeleteId: existingViewGroupToDelete.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: {
              from: fromFlatViewGroupMaps,
              to: toFlatViewGroupMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps: existingFlatViewMaps,
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view group',
      );
    }

    return existingViewGroupToDelete;
  }
}
