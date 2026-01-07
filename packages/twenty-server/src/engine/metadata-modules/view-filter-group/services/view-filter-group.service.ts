import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, type Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-create-view-filter-group-input-to-flat-view-filter-group-to-create.util';
import { fromDeleteViewFilterGroupInputToFlatViewFilterGroupOrThrow } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-delete-view-filter-group-input-to-flat-view-filter-group-or-throw.util';
import { fromDestroyViewFilterGroupInputToFlatViewFilterGroupOrThrow } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-destroy-view-filter-group-input-to-flat-view-filter-group-or-throw.util';
import { fromUpdateViewFilterGroupInputToFlatViewFilterGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-update-view-filter-group-input-to-flat-view-filter-group-to-update-or-throw.util';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { type DeleteViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/delete-view-filter-group.input';
import { type DestroyViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/destroy-view-filter-group.input';
import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { fromFlatViewFilterGroupToViewFilterGroupDto } from 'src/engine/metadata-modules/view-filter-group/utils/from-flat-view-filter-group-to-view-filter-group-dto.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFilterGroupService {
  constructor(
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewFilterGroupInput,
    workspaceId,
  }: {
    createViewFilterGroupInput: CreateViewFilterGroupInput;
    workspaceId: string;
  }): Promise<ViewFilterGroupDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatViewFilterGroupToCreate =
      fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate({
        createViewFilterGroupInput,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilterGroup: {
              flatEntityToCreate: [flatViewFilterGroupToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(buildAndRunResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        buildAndRunResult,
        'Multiple validation errors occurred while creating view filter group',
      );
    }

    const {
      flatViewFilterGroupMaps: recomputedExistingFlatViewFilterGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    return fromFlatViewFilterGroupToViewFilterGroupDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatViewFilterGroupToCreate.id,
        flatEntityMaps: recomputedExistingFlatViewFilterGroupMaps,
      }),
    );
  }

  async updateOne({
    id,
    updateViewFilterGroupInput,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
    updateViewFilterGroupInput: UpdateViewFilterGroupInput;
  }): Promise<ViewFilterGroupDTO> {
    const { flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewFilterGroup =
      fromUpdateViewFilterGroupInputToFlatViewFilterGroupToUpdateOrThrow({
        flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
        updateViewFilterGroupInput: { id, ...updateViewFilterGroupInput },
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilterGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewFilterGroup],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view filter group',
      );
    }

    const {
      flatViewFilterGroupMaps: recomputedExistingFlatViewFilterGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    return fromFlatViewFilterGroupToViewFilterGroupDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: optimisticallyUpdatedFlatViewFilterGroup.id,
        flatEntityMaps: recomputedExistingFlatViewFilterGroupMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewFilterGroupInput,
    workspaceId,
  }: {
    deleteViewFilterGroupInput: DeleteViewFilterGroupInput;
    workspaceId: string;
  }): Promise<ViewFilterGroupDTO> {
    const { flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewFilterGroupWithDeletedAt =
      fromDeleteViewFilterGroupInputToFlatViewFilterGroupOrThrow({
        flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
        deleteViewFilterGroupInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilterGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewFilterGroupWithDeletedAt,
              ],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view filter group',
      );
    }

    const {
      flatViewFilterGroupMaps: recomputedExistingFlatViewFilterGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    return fromFlatViewFilterGroupToViewFilterGroupDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: optimisticallyUpdatedFlatViewFilterGroupWithDeletedAt.id,
        flatEntityMaps: recomputedExistingFlatViewFilterGroupMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewFilterGroupInput,
    workspaceId,
  }: {
    destroyViewFilterGroupInput: DestroyViewFilterGroupInput;
    workspaceId: string;
  }): Promise<ViewFilterGroupDTO> {
    const { flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps'],
        },
      );

    const existingViewFilterGroupToDelete =
      fromDestroyViewFilterGroupInputToFlatViewFilterGroupOrThrow({
        destroyViewFilterGroupInput,
        flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilterGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFilterGroupToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view filter group',
      );
    }

    return fromFlatViewFilterGroupToViewFilterGroupDto(
      existingViewFilterGroupToDelete,
    );
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<ViewFilterGroupEntity[]> {
    return this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilterGroupEntity[]> {
    return this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterGroupEntity | null> {
    const viewFilterGroup = await this.viewFilterGroupRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: [
        'workspace',
        'view',
        'viewFilters',
        'parentViewFilterGroup',
        'childViewFilterGroups',
      ],
    });

    return viewFilterGroup || null;
  }
}
