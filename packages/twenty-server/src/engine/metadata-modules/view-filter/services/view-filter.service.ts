import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { fromCreateViewFilterInputToFlatViewFilterToCreate } from 'src/engine/metadata-modules/flat-view-filter/utils/from-create-view-filter-input-to-flat-view-filter-to-create.util';
import { fromDestroyViewFilterInputToFlatViewFilterOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-destroy-view-filter-input-to-flat-view-filter-or-throw.util';
import { fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-update-view-filter-input-to-flat-view-filter-to-update-or-throw.util';
import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';
import { paginateMetadataOrderedItems } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-ordered-items.util';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
  ViewFilterExceptionMessageKey,
  generateViewFilterExceptionMessage,
  generateViewFilterUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { fromFlatViewFilterToViewFilterDto } from 'src/engine/metadata-modules/view-filter/utils/from-flat-view-filter-to-view-filter-dto.util';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFilterService {
  constructor(
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
    return this.destroyOne({
      destroyViewFilterInput: deleteViewFilterInput,
      workspaceId,
    });
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

  async findByWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewFilterDTO[]> {
    const flatViewFilters = await this.findManyFlatViewFiltersVisibleToUser({
      workspaceId,
      userWorkspaceId,
    });

    return flatViewFilters.map(fromFlatViewFilterToViewFilterDto);
  }

  async findManyPaginated({
    workspaceId,
    viewId,
    userWorkspaceId,
    pagination,
  }: {
    workspaceId: string;
    viewId?: string;
    userWorkspaceId: string | undefined;
    pagination: MetadataCursorPagination;
  }): Promise<MetadataCursorPage<ViewFilterDTO> & { totalCount: number }> {
    const flatViewFilters = await this.findManyFlatViewFiltersVisibleToUser({
      workspaceId,
      viewId,
      userWorkspaceId,
    });
    const page = paginateMetadataOrderedItems({
      items: flatViewFilters,
      pagination,
    });

    return {
      ...page,
      items: page.items.map(fromFlatViewFilterToViewFilterDto),
      totalCount: flatViewFilters.length,
    };
  }

  async findByViewId({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewFilterDTO[]> {
    const flatViewFilters = await this.findManyFlatViewFiltersVisibleToUser({
      workspaceId,
      viewId,
      userWorkspaceId,
    });

    return flatViewFilters.map(fromFlatViewFilterToViewFilterDto);
  }

  private async findManyFlatViewFiltersVisibleToUser({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId?: string;
    userWorkspaceId: string | undefined;
  }): Promise<FlatViewFilter[]> {
    const { flatViewFilterMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps', 'flatViewMaps'],
        },
      );
    const flatViews = isDefined(viewId)
      ? [
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: viewId,
            flatEntityMaps: flatViewMaps,
          }),
        ]
      : Object.values(flatViewMaps.byUniversalIdentifier);

    return flatViews
      .filter(isDefined)
      .filter((flatView) =>
        isViewAvailableToUser({ flatView, userWorkspaceId }),
      )
      .flatMap((flatView) =>
        findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatView.viewFilterIds,
          flatEntityMaps: flatViewFilterMaps,
        }),
      )
      .filter((flatViewFilter) => flatViewFilter.deletedAt === null)
      .sort(
        (first, second) =>
          (first.positionInViewFilterGroup ?? Number.POSITIVE_INFINITY) -
            (second.positionInViewFilterGroup ?? Number.POSITIVE_INFINITY) ||
          first.id.localeCompare(second.id),
      );
  }

  async findByIdOrThrow({
    id,
    workspaceId,
    userWorkspaceId,
  }: {
    id: string;
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewFilterDTO> {
    const { flatViewFilterMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterMaps', 'flatViewMaps'],
        },
      );
    const flatViewFilter = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatViewFilterMaps,
    });
    const flatView = isDefined(flatViewFilter)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatViewFilter.viewId,
          flatEntityMaps: flatViewMaps,
        })
      : undefined;

    if (
      !isDefined(flatViewFilter) ||
      flatViewFilter.deletedAt !== null ||
      !isDefined(flatView) ||
      !isViewAvailableToUser({ flatView, userWorkspaceId })
    ) {
      throw new ViewFilterException(
        generateViewFilterExceptionMessage(
          ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          id,
        ),
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        {
          userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
          ),
        },
      );
    }

    return fromFlatViewFilterToViewFilterDto(flatViewFilter);
  }
}
