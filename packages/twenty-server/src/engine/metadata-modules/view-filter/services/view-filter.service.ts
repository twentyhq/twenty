import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
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
import { fromFlatViewFilterToViewFilterDto } from 'src/engine/metadata-modules/view-filter/utils/from-flat-view-filter-to-view-filter-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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

    const { flatFieldMetadataMaps, flatViewMaps, flatViewFilterGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatViewMaps',
            'flatViewFilterGroupMaps',
          ],
        },
      );

    const flatViewFilterToCreate =
      fromCreateViewFilterInputToFlatViewFilterToCreate({
        createViewFilterInput,
        flatApplication: workspaceCustomFlatApplication,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFilterGroupMaps,
      });

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilter: {
              flatEntityToCreate: [flatViewFilterToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (buildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        buildAndRunResult,
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

    return fromFlatViewFilterToViewFilterDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatViewFilterToCreate.id,
        flatEntityMaps: recomputedExistingFlatViewFilterMaps,
      }),
    );
  }

  async updateOne({
    updateViewFilterInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFilterInput: UpdateViewFilterInput;
  }): Promise<ViewFilterDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatViewFilterMaps: existingFlatViewFilterMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFilterMaps',
          'flatFieldMetadataMaps',
          'flatViewFilterGroupMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewFilter =
      fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow({
        flatViewFilterMaps: existingFlatViewFilterMaps,
        updateViewFilterInput,
        flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
        flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewFilter],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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

    return fromFlatViewFilterToViewFilterDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewFilter.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFilterMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewFilterInput,
    workspaceId,
  }: {
    deleteViewFilterInput: DeleteViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFilterMaps: existingFlatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps'],
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
          allFlatEntityOperationByMetadataName: {
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewFilterWithDeletedAt,
              ],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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

    return fromFlatViewFilterToViewFilterDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewFilterWithDeletedAt.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFilterMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewFilterInput,
    workspaceId,
  }: {
    destroyViewFilterInput: DestroyViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFilterMaps: existingFlatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps'],
        },
      );

    const existingViewFilterToDelete =
      fromDestroyViewFilterInputToFlatViewFilterOrThrow({
        destroyViewFilterInput,
        flatViewFilterMaps: existingFlatViewFilterMaps,
      });

    const existingFlatViewFilter = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: existingViewFilterToDelete.universalIdentifier,
      flatEntityMaps: existingFlatViewFilterMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFilterToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view filter',
      );
    }

    return fromFlatViewFilterToViewFilterDto({
      ...existingFlatViewFilter,
      deletedAt: new Date().toISOString(),
    });
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
