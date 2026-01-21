import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewSortInputToFlatViewSortToCreate } from 'src/engine/metadata-modules/flat-view-sort/utils/from-create-view-sort-input-to-flat-view-sort-to-create.util';
import { fromDeleteViewSortInputToFlatViewSortOrThrow } from 'src/engine/metadata-modules/flat-view-sort/utils/from-delete-view-sort-input-to-flat-view-sort-or-throw.util';
import { fromDestroyViewSortInputToFlatViewSortOrThrow } from 'src/engine/metadata-modules/flat-view-sort/utils/from-destroy-view-sort-input-to-flat-view-sort-or-throw.util';
import { fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-sort/utils/from-update-view-sort-input-to-flat-view-sort-to-update-or-throw.util';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import { DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { fromFlatViewSortToViewSortDto } from 'src/engine/metadata-modules/view-sort/utils/from-flat-view-sort-to-view-sort-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewSortService {
  constructor(
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewSortInput,
    workspaceId,
  }: {
    createViewSortInput: CreateViewSortInput;
    workspaceId: string;
  }): Promise<ViewSortDTO> {
    const [createdViewSort] = await this.createMany({
      workspaceId,
      createViewSortInputs: [createViewSortInput],
    });

    if (!isDefined(createdViewSort)) {
      throw new ViewSortException(
        'Failed to create view sort',
        ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
      );
    }

    return createdViewSort;
  }

  async createMany({
    createViewSortInputs,
    workspaceId,
  }: {
    createViewSortInputs: CreateViewSortInput[];
    workspaceId: string;
  }): Promise<ViewSortDTO[]> {
    if (createViewSortInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatViewSortsToCreate = createViewSortInputs.map(
      (createViewSortInput) =>
        fromCreateViewSortInputToFlatViewSortToCreate({
          createViewSortInput,
          workspaceId,
          workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewSort: {
              flatEntityToCreate: flatViewSortsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view sorts',
      );
    }

    const { flatViewSortMaps: recomputedExistingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewSortsToCreate.map((viewSort) => viewSort.id),
      flatEntityMaps: recomputedExistingFlatViewSortMaps,
    }).map(fromFlatViewSortToViewSortDto);
  }

  async updateOne({
    updateViewSortInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewSortInput: UpdateViewSortInput;
  }): Promise<ViewSortDTO> {
    const { flatViewSortMaps: existingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewSort =
      fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow({
        flatViewSortMaps: existingFlatViewSortMaps,
        updateViewSortInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewSort: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewSort],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view sort',
      );
    }

    const { flatViewSortMaps: recomputedExistingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    return fromFlatViewSortToViewSortDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: optimisticallyUpdatedFlatViewSort.id,
        flatEntityMaps: recomputedExistingFlatViewSortMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewSortInput,
    workspaceId,
  }: {
    deleteViewSortInput: DeleteViewSortInput;
    workspaceId: string;
  }): Promise<ViewSortDTO> {
    const { flatViewSortMaps: existingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewSortWithDeletedAt =
      fromDeleteViewSortInputToFlatViewSortOrThrow({
        flatViewSortMaps: existingFlatViewSortMaps,
        deleteViewSortInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewSort: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewSortWithDeletedAt,
              ],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view sort',
      );
    }

    const { flatViewSortMaps: recomputedExistingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    return fromFlatViewSortToViewSortDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: optimisticallyUpdatedFlatViewSortWithDeletedAt.id,
        flatEntityMaps: recomputedExistingFlatViewSortMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewSortInput,
    workspaceId,
  }: {
    destroyViewSortInput: DestroyViewSortInput;
    workspaceId: string;
  }): Promise<ViewSortDTO> {
    const { flatViewSortMaps: existingFlatViewSortMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps'],
        },
      );

    const existingViewSortToDelete =
      fromDestroyViewSortInputToFlatViewSortOrThrow({
        destroyViewSortInput,
        flatViewSortMaps: existingFlatViewSortMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewSort: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewSortToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view sort',
      );
    }

    return fromFlatViewSortToViewSortDto(existingViewSortToDelete);
  }

  async findByWorkspaceId(workspaceId: string): Promise<ViewSortEntity[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewSortEntity[]> {
    return this.viewSortRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewSortEntity | null> {
    const viewSort = await this.viewSortRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewSort || null;
  }
}
