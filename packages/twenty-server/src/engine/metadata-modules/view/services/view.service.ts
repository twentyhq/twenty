import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { fromDeleteViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-delete-view-input-to-flat-view-or-throw.util';
import { fromDestroyViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-destroy-view-input-to-flat-view-or-throw.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import { DestroyViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/destroy-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly i18nService: I18nService,
  ) {}

  async createOne({
    createViewInput,
    workspaceId,
    createdByUserWorkspaceId,
  }: {
    createViewInput: CreateViewInput;
    workspaceId: string;
    createdByUserWorkspaceId?: string;
  }): Promise<ViewDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatObjectMetadataMaps,
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const flatViewFromCreateInput = fromCreateViewInputToFlatViewToCreate({
      createViewInput,
      workspaceId,
      createdByUserWorkspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [flatViewFromCreateInput],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: flatObjectMetadataMaps,
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
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
        'Multiple validation errors occurred while creating view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFromCreateInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async updateOne({
    updateViewInput,
    workspaceId,
    userWorkspaceId,
  }: {
    updateViewInput: UpdateViewInput;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatViewFromUpdateInput =
      fromUpdateViewInputToFlatViewToUpdateOrThrow({
        updateViewInput,
        flatViewMaps: existingFlatViewMaps,
      });

    const existingFlatView = existingFlatViewMaps.byId[updateViewInput.id];

    // If changing visibility from WORKSPACE to UNLISTED, ensure createdByUserWorkspaceId is set
    // This prevents the view from disappearing for the user making the change
    if (
      isDefined(existingFlatView) &&
      isDefined(updateViewInput.visibility) &&
      updateViewInput.visibility === 'UNLISTED' &&
      existingFlatView.visibility === 'WORKSPACE' &&
      isDefined(userWorkspaceId)
    ) {
      // Re-allocate the view to the current user
      flatViewFromUpdateInput.createdByUserWorkspaceId = userWorkspaceId;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatViewFromUpdateInput],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
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
        'Multiple validation errors occurred while updating view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: updateViewInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async deleteOne({
    deleteViewInput,
    workspaceId,
  }: {
    deleteViewInput: DeleteViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewWithDeletedAt =
      fromDeleteViewInputToFlatViewOrThrow({
        deleteViewInput,
        flatViewMaps: existingFlatViewMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewWithDeletedAt],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
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
        'Multiple validation errors occurred while deleting view',
      );
    }

    const { flatViewMaps: recomputedExistingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: deleteViewInput.id,
      flatEntityMaps: recomputedExistingFlatViewMaps,
    });
  }

  async destroyOne({
    destroyViewInput,
    workspaceId,
  }: {
    destroyViewInput: DestroyViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatViewFromDestroyInput = fromDestroyViewInputToFlatViewOrThrow({
      destroyViewInput,
      flatViewMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatViewMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [flatViewFromDestroyInput],
              flatEntityToUpdate: [],
            }),
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              view: true,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view',
      );
    }

    return flatViewFromDestroyInput;
  }

  processViewNameWithTemplate(
    viewName: string,
    isCustom: boolean,
    objectLabelPlural?: string,
    locale?: keyof typeof APP_LOCALES,
  ): string {
    if (viewName.includes('{objectLabelPlural}') && objectLabelPlural) {
      const messageId = generateMessageId(viewName);
      const translatedTemplate = this.i18nService.translateMessage({
        messageId,
        values: {
          objectLabelPlural,
        },
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedTemplate !== messageId) {
        return translatedTemplate;
      }

      return viewName.replace('{objectLabelPlural}', objectLabelPlural);
    }

    if (!isCustom) {
      const messageId = generateMessageId(viewName);
      const translatedMessage = this.i18nService.translateMessage({
        messageId,
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedMessage !== messageId) {
        return translatedMessage;
      }
    }

    return viewName;
  }

  async findByWorkspaceId(
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<ViewEntity[]> {
    const views = await this.viewRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });

    return views.filter((view) => {
      if (view.visibility === ViewVisibility.WORKSPACE) {
        return true;
      }

      if (
        view.visibility === ViewVisibility.UNLISTED &&
        isDefined(userWorkspaceId) &&
        view.createdByUserWorkspaceId === userWorkspaceId
      ) {
        return true;
      }

      return false;
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    userWorkspaceId?: string,
  ): Promise<ViewEntity[]> {
    const views = await this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });

    // Apply visibility filtering
    return views.filter((view) => {
      if (view.visibility === ViewVisibility.WORKSPACE) {
        return true;
      }

      if (
        view.visibility === ViewVisibility.UNLISTED &&
        isDefined(userWorkspaceId) &&
        view.createdByUserWorkspaceId === userWorkspaceId
      ) {
        return true;
      }

      return false;
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewEntity | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });

    return view || null;
  }

  async findByIdIncludingDeleted(
    id: string,
    workspaceId: string,
  ): Promise<ViewEntity | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
      withDeleted: true,
    });

    return view || null;
  }
}
