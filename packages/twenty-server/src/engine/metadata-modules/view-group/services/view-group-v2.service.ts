import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewGroupInputToFlatViewGroupToCreate } from 'src/engine/metadata-modules/flat-view-group/utils/from-create-view-group-input-to-flat-view-group-to-create.util';
import { fromDeleteViewGroupInputToFlatViewGroupOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-delete-view-group-input-to-flat-view-group-or-throw.util';
import { fromDestroyViewGroupInputToFlatViewGroupOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-destroy-view-group-input-to-flat-view-group-or-throw.util';
import { fromUpdateViewGroupInputToFlatViewGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-group/utils/from-update-view-group-input-to-flat-view-group-to-update-or-throw.util';
import { CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import { DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import { UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
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
    const [createdViewGroup] = await this.createMany({
      workspaceId,
      createViewGroupInputs: [createViewGroupInput],
    });

    if (!isDefined(createdViewGroup)) {
      throw new ViewGroupException(
        'Failed to create view group',
        ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
      );
    }

    return createdViewGroup;
  }

  async createMany({
    createViewGroupInputs,
    workspaceId,
  }: {
    createViewGroupInputs: CreateViewGroupInput[];
    workspaceId: string;
  }): Promise<ViewGroupDTO[]> {
    if (createViewGroupInputs.length === 0) {
      return [];
    }

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

    const flatViewGroupsToCreate = createViewGroupInputs.map(
      (createViewGroupInput) =>
        fromCreateViewGroupInputToFlatViewGroupToCreate({
          createViewGroupInput,
          workspaceId,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewGroupMaps,
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
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
        'Multiple validation errors occurred while creating view groups',
      );
    }

    const { flatViewGroupMaps: recomputedExistingFlatViewGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewGroupMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewGroupsToCreate.map((el) => el.id),
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewGroupMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewGroup],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps,
            flatFieldMetadataMaps,
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewGroupMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewGroupWithDeletedAt,
              ],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewGroupMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewGroupMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewGroupToDelete],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps: existingFlatViewMaps,
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              viewGroup: true,
            },
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
