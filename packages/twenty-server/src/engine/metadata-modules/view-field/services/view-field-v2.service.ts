import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromDeleteViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-delete-view-field-input-to-flat-view-field-or-throw.util';
import { fromDestroyViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-destroy-view-field-input-to-flat-view-field-or-throw.util';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFieldV2Service {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createViewFieldInput,
    workspaceId,
  }: {
    createViewFieldInput: CreateViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const [createdViewField] = await this.createMany({
      workspaceId,
      createViewFieldInputs: [createViewFieldInput],
    });

    if (!isDefined(createdViewField)) {
      throw new ViewFieldException(
        'Failed to create view field',
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
      );
    }

    return createdViewField;
  }

  async createMany({
    createViewFieldInputs,
    workspaceId,
  }: {
    createViewFieldInputs: CreateViewFieldInput[];
    workspaceId: string;
  }): Promise<ViewFieldDTO[]> {
    if (createViewFieldInputs.length === 0) {
      return [];
    }

    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFieldMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
          'flatObjectMetadataMaps',
        ],
      },
    );

    const flatViewFieldsToCreate = createViewFieldInputs.map(
      (createViewFieldInput) =>
        fromCreateViewFieldInputToFlatViewFieldToCreate({
          createViewFieldInput,
          workspaceId,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: flatViewFieldsToCreate,
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
        'Multiple validation errors occurred while creating view fields',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewFieldsToCreate.map((el) => el.id),
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async updateOne({
    updateViewFieldInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFieldInput: UpdateViewFieldInput;
  }): Promise<ViewFieldDTO> {
    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFieldMaps',
          'flatObjectMetadataMaps',
          'flatViewMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatView =
      fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        updateViewFieldInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatView],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps,
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
        'Multiple validation errors occurred while updating view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatView.id,
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async deleteOne({
    deleteViewFieldInput,
    workspaceId,
  }: {
    deleteViewFieldInput: DeleteViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFieldMaps',
          'flatObjectMetadataMaps',
          'flatViewMaps',
        ],
      },
    );

    const optimisticallyUpdatedFlatViewWithDeletedAt =
      fromDeleteViewFieldInputToFlatViewFieldOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        deleteViewFieldInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewWithDeletedAt],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps,
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
        'Multiple validation errors occurred while deleting view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async destroyOne({
    destroyViewFieldInput,
    workspaceId,
  }: {
    destroyViewFieldInput: DestroyViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewFieldMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
          'flatObjectMetadataMaps',
        ],
      },
    );

    const existingViewFieldToDelete =
      fromDestroyViewFieldInputToFlatViewFieldOrThrow({
        destroyViewFieldInput,
        flatViewFieldMaps: existingFlatViewFieldMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewFieldMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFieldToDelete],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps: existingFlatViewMaps,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              viewField: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view field',
      );
    }

    return existingViewFieldToDelete;
  }
}
