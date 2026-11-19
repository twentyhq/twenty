import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-create-view-filter-group-input-to-flat-view-filter-group-to-create.util';
import { fromDestroyViewFilterGroupInputToFlatViewFilterGroupOrThrow } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-destroy-view-filter-group-input-to-flat-view-filter-group-or-throw.util';
import { fromUpdateViewFilterGroupInputToFlatViewFilterGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-update-view-filter-group-input-to-flat-view-filter-group-to-update-or-throw.util';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { type DeleteViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/delete-view-filter-group.input';
import { type DestroyViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/destroy-view-filter-group.input';
import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { fromFlatViewFilterGroupToViewFilterGroupDto } from 'src/engine/metadata-modules/view-filter-group/utils/from-flat-view-filter-group-to-view-filter-group-dto.util';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFilterGroupService {
  constructor(
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

    const {
      flatViewMaps: existingFlatViewMaps,
      flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatViewFilterGroupMaps'],
        },
      );

    const flatViewFilterGroupToCreate =
      fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate({
        createViewFilterGroupInput,
        flatApplication: workspaceCustomFlatApplication,
        flatViewMaps: existingFlatViewMaps,
        flatViewFilterGroupMaps: existingFlatViewFilterGroupMaps,
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (buildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewFilterGroup.universalIdentifier,
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
    return this.destroyOne({
      destroyViewFilterGroupInput: deleteViewFilterGroupInput,
      workspaceId,
    });
  }

  async destroyOne({
    destroyViewFilterGroupInput,
    workspaceId,
  }: {
    destroyViewFilterGroupInput: DestroyViewFilterGroupInput;
    workspaceId: string;
  }): Promise<ViewFilterGroupDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

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

    const existingFlatViewFilterGroup =
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          existingViewFilterGroupToDelete.universalIdentifier,
        flatEntityMaps: existingFlatViewFilterGroupMaps,
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view filter group',
      );
    }

    return fromFlatViewFilterGroupToViewFilterGroupDto({
      ...existingFlatViewFilterGroup,
      deletedAt: new Date().toISOString(),
    });
  }

  async findByWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewFilterGroupDTO[]> {
    const flatViewFilterGroups =
      await this.findManyFlatViewFilterGroupsVisibleToUser({
        workspaceId,
        userWorkspaceId,
      });

    return flatViewFilterGroups.map(
      fromFlatViewFilterGroupToViewFilterGroupDto,
    );
  }

  async findByViewId({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId: string;
    userWorkspaceId: string | undefined;
  }): Promise<ViewFilterGroupDTO[]> {
    const flatViewFilterGroups =
      await this.findManyFlatViewFilterGroupsVisibleToUser({
        workspaceId,
        viewId,
        userWorkspaceId,
      });

    return flatViewFilterGroups.map(
      fromFlatViewFilterGroupToViewFilterGroupDto,
    );
  }

  private async findManyFlatViewFilterGroupsVisibleToUser({
    workspaceId,
    viewId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    viewId?: string;
    userWorkspaceId: string | undefined;
  }): Promise<FlatViewFilterGroup[]> {
    const { flatViewFilterGroupMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps', 'flatViewMaps'],
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
          flatEntityIds: flatView.viewFilterGroupIds,
          flatEntityMaps: flatViewFilterGroupMaps,
        }),
      )
      .filter((flatViewFilterGroup) => flatViewFilterGroup.deletedAt === null)
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
  }): Promise<ViewFilterGroupDTO> {
    const { flatViewFilterGroupMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFilterGroupMaps', 'flatViewMaps'],
        },
      );
    const flatViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatViewFilterGroupMaps,
    });
    const flatView = isDefined(flatViewFilterGroup)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatViewFilterGroup.viewId,
          flatEntityMaps: flatViewMaps,
        })
      : undefined;

    if (
      !isDefined(flatViewFilterGroup) ||
      flatViewFilterGroup.deletedAt !== null ||
      !isDefined(flatView) ||
      !isViewAvailableToUser({ flatView, userWorkspaceId })
    ) {
      throw new ViewFilterGroupException(
        generateViewFilterGroupExceptionMessage(
          ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
          id,
        ),
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        {
          userFriendlyMessage:
            generateViewFilterGroupUserFriendlyExceptionMessage(
              ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
            ),
        },
      );
    }

    return fromFlatViewFilterGroupToViewFilterGroupDto(flatViewFilterGroup);
  }
}
