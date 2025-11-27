import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFilterInputToFlatViewFilterToCreate } from 'src/engine/metadata-modules/flat-view-filter/utils/from-create-view-filter-input-to-flat-view-filter-to-create.util';
import { fromDeleteViewFilterInputToFlatViewFilterOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-delete-view-filter-input-to-flat-view-filter-or-throw.util';
import { fromDestroyViewFilterInputToFlatViewFilterOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-destroy-view-filter-input-to-flat-view-filter-or-throw.util';
import { fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-update-view-filter-input-to-flat-view-filter-to-update-or-throw.util';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFilterService {
  constructor(
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewFilterInput,
    workspaceId,
  }: {
    createViewFilterInput: CreateViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFilterMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
          'flatObjectMetadataMaps',
        ],
      },
    );

    const flatViewFilterToCreate =
      fromCreateViewFilterInputToFlatViewFilterToCreate({
        createViewFilterInput,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFilterMaps,
              flatEntityToCreate: [flatViewFilterToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
            flatObjectMetadataMaps,
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
        'Multiple validation errors occurred while creating view filter',
      );
    }

    const { flatViewFilterMaps: recomputedExistingFlatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFilterToCreate.id,
      flatEntityMaps: recomputedExistingFlatViewFilterMaps,
    });
  }

  async updateOne({
    updateViewFilterInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFilterInput: UpdateViewFilterInput;
  }): Promise<ViewFilterDTO> {
    const {
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFilterMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewFilter =
      fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow({
        flatViewFilterMaps: existingFlatViewFilterMaps,
        updateViewFilterInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFilterMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewFilter],
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
        'Multiple validation errors occurred while updating view filter',
      );
    }

    const { flatViewFilterMaps: recomputedExistingFlatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewFilter.id,
      flatEntityMaps: recomputedExistingFlatViewFilterMaps,
    });
  }

  async deleteOne({
    deleteViewFilterInput,
    workspaceId,
  }: {
    deleteViewFilterInput: DeleteViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
    const {
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFilterMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewFilterWithDeletedAt =
      fromDeleteViewFilterInputToFlatViewFilterOrThrow({
        flatViewFilterMaps: existingFlatViewFilterMaps,
        deleteViewFilterInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFilterMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewFilterWithDeletedAt,
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
        'Multiple validation errors occurred while deleting view filter',
      );
    }

    const { flatViewFilterMaps: recomputedExistingFlatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewFilterWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatViewFilterMaps,
    });
  }

  async destroyOne({
    destroyViewFilterInput,
    workspaceId,
  }: {
    destroyViewFilterInput: DestroyViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
    const {
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFilterMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const existingViewFilterToDelete =
      fromDestroyViewFilterInputToFlatViewFilterOrThrow({
        destroyViewFilterInput,
        flatViewFilterMaps: existingFlatViewFilterMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFilterMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFilterToDelete],
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
              viewFilter: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view filter',
      );
    }

    return existingViewFilterToDelete;
  }

  async findByWorkspaceId(workspaceId: string): Promise<ViewFilterEntity[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilterEntity[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilterEntity | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view', 'viewFilterGroup'],
    });

    return viewFilter || null;
  }
}
