import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFilterInputToFlatViewFilterToCreate } from 'src/engine/metadata-modules/flat-view-filter/utils/from-create-view-filter-input-to-flat-view-filter-to-create.util';
import { fromDeleteViewFilterInputToFlatViewFilterOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-delete-view-filter-input-to-flat-view-filter-or-throw.util';
import { fromDestroyViewFilterInputToFlatViewFilterOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-destroy-view-filter-input-to-flat-view-filter-or-throw.util';
import { fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-filter/utils/from-update-view-filter-input-to-flat-view-filter-to-update-or-throw.util';
import { CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import { UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFilterV2Service {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createViewFilterInput,
    workspaceId,
  }: {
    createViewFilterInput: CreateViewFilterInput;
    workspaceId: string;
  }): Promise<ViewFilterDTO> {
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
      });

    const toFlatViewFilterMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatViewFilterToCreate,
      flatEntityMaps: existingFlatViewFilterMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: {
              from: existingFlatViewFilterMaps,
              to: toFlatViewFilterMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
            flatObjectMetadataMaps,
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
    updateViewFilterInput: Omit<UpdateViewFilterInput, 'id'> &
      Required<Pick<UpdateViewFilterInput, 'id'>>;
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

    const toFlatViewFilterMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatViewFilter,
      flatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: {
              from: existingFlatViewFilterMaps,
              to: toFlatViewFilterMaps,
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

    const toFlatViewFilterMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatViewFilterWithDeletedAt,
      flatEntityMaps: existingFlatViewFilterMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: {
              from: existingFlatViewFilterMaps,
              to: toFlatViewFilterMaps,
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

    const fromFlatViewFilterMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingViewFilterToDelete.id],
      flatEntityMaps: existingFlatViewFilterMaps,
    });
    const toFlatViewFilterMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: fromFlatViewFilterMaps,
      entityToDeleteId: existingViewFilterToDelete.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFilterMaps: {
              from: fromFlatViewFilterMaps,
              to: toFlatViewFilterMaps,
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
        'Multiple validation errors occurred while deleting view filter',
      );
    }

    return existingViewFilterToDelete;
  }
}
