import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatViewAvailableToUser } from 'src/engine/metadata-modules/flat-view/utils/find-flat-view-available-to-user.util';
import { findManyFlatViewChildrenAvailableToUser } from 'src/engine/metadata-modules/flat-view/utils/find-many-flat-view-children-available-to-user.util';
import { sortViewSortsByCreation } from 'src/engine/metadata-modules/flat-view/utils/sort-view-sorts-by-creation.util';
import { fromCreateViewSortInputToFlatViewSortToCreate } from 'src/engine/metadata-modules/flat-view-sort/utils/from-create-view-sort-input-to-flat-view-sort-to-create.util';
import { fromDestroyViewSortInputToFlatViewSortOrThrow } from 'src/engine/metadata-modules/flat-view-sort/utils/from-destroy-view-sort-input-to-flat-view-sort-or-throw.util';
import { fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-sort/utils/from-update-view-sort-input-to-flat-view-sort-to-update-or-throw.util';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessageKey,
  generateViewSortExceptionMessage,
  generateViewSortUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import { DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';
import { UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { fromFlatViewSortToViewSortDto } from 'src/engine/metadata-modules/view-sort/utils/from-flat-view-sort-to-view-sort-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewSortService {
  constructor(
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatFieldMetadataMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps', 'flatViewMaps'],
        },
      );

    const flatViewSortToCreate = fromCreateViewSortInputToFlatViewSortToCreate({
      createViewSortInput,
      flatApplication: workspaceCustomFlatApplication,
      flatFieldMetadataMaps,
      flatViewMaps,
    });

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewSort: {
              flatEntityToCreate: [flatViewSortToCreate],
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
        'Multiple validation errors occurred while creating view sort',
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
        flatEntityId: flatViewSortToCreate.id,
        flatEntityMaps: recomputedExistingFlatViewSortMaps,
      }),
    );
  }

  async updateOne({
    updateViewSortInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewSortInput: UpdateViewSortInput;
  }): Promise<ViewSortDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatViewSortMaps: existingFlatViewSortMaps,
      flatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps', 'flatFieldMetadataMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewSort =
      fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow({
        flatViewSortMaps: existingFlatViewSortMaps,
        flatFieldMetadataMaps,
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
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
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewSort.universalIdentifier,
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
    return this.destroyOne({
      destroyViewSortInput: deleteViewSortInput,
      workspaceId,
    });
  }

  async destroyOne({
    destroyViewSortInput,
    workspaceId,
  }: {
    destroyViewSortInput: DestroyViewSortInput;
    workspaceId: string;
  }): Promise<ViewSortDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

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

    const existingFlatViewSort = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: existingViewSortToDelete.universalIdentifier,
      flatEntityMaps: existingFlatViewSortMaps,
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view sort',
      );
    }

    return fromFlatViewSortToViewSortDto(existingFlatViewSort);
  }

  async findByWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewSortDTO[]> {
    return this.findManyVisibleToUser({ workspaceId, userWorkspaceId });
  }

  async findByViewId({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewSortDTO[]> {
    return this.findManyVisibleToUser({ workspaceId, viewId, userWorkspaceId });
  }

  private async findManyVisibleToUser({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId?: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewSortDTO[]> {
    const { flatViewSortMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps', 'flatViewMaps'],
        },
      );

    return sortViewSortsByCreation(
      findManyFlatViewChildrenAvailableToUser({
        flatViewMaps,
        flatViewChildMaps: flatViewSortMaps,
        flatViewChildIdsKey: 'viewSortIds',
        viewId,
        userWorkspaceId,
      }).map(fromFlatViewSortToViewSortDto),
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
  }): Promise<ViewSortDTO> {
    const { flatViewSortMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewSortMaps', 'flatViewMaps'],
        },
      );
    const flatViewSort = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatViewSortMaps,
    });

    if (
      !isDefined(flatViewSort) ||
      flatViewSort.deletedAt !== null ||
      !isDefined(
        findFlatViewAvailableToUser({
          viewId: flatViewSort.viewId,
          flatViewMaps,
          userWorkspaceId,
        }),
      )
    ) {
      throw new ViewSortException(
        generateViewSortExceptionMessage(
          ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          id,
        ),
        ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        {
          userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
          ),
        },
      );
    }

    return fromFlatViewSortToViewSortDto(flatViewSort);
  }
}
