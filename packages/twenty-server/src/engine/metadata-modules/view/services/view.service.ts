import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { ViewType, ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { fromDeleteViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-delete-view-input-to-flat-view-or-throw.util';
import { fromDestroyViewInputToFlatViewOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-destroy-view-input-to-flat-view-or-throw.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { fromFlatViewFieldGroupToViewFieldGroupDto } from 'src/engine/metadata-modules/view-field-group/utils/from-flat-view-field-group-to-view-field-group-dto.util';
import { fromFlatViewFieldToViewFieldDto } from 'src/engine/metadata-modules/view-field/utils/from-flat-view-field-to-view-field-dto.util';
import { fromFlatViewFilterGroupToViewFilterGroupDto } from 'src/engine/metadata-modules/view-filter-group/utils/from-flat-view-filter-group-to-view-filter-group-dto.util';
import { fromFlatViewFilterToViewFilterDto } from 'src/engine/metadata-modules/view-filter/utils/from-flat-view-filter-to-view-filter-dto.util';
import { fromFlatViewGroupToViewGroupDto } from 'src/engine/metadata-modules/view-group/utils/from-flat-view-group-to-view-group-dto.util';
import { fromFlatViewSortToViewSortDto } from 'src/engine/metadata-modules/view-sort/utils/from-flat-view-sort-to-view-sort-dto.util';
import { CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import { DestroyViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/destroy-view.input';
import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { fromFlatViewToViewDto } from 'src/engine/metadata-modules/view/utils/from-flat-view-to-view-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
        },
      );

    const { flatViewToCreate, flatViewGroupsToCreate } =
      fromCreateViewInputToFlatViewToCreate({
        createViewInput,
        createdByUserWorkspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [flatViewToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },

            viewGroup: {
              flatEntityToCreate: flatViewGroupsToCreate,
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

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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

    return fromFlatViewToViewDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatViewToCreate.id,
        flatEntityMaps: recomputedExistingFlatViewMaps,
      }),
    );
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatViewMaps: existingFlatViewMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatViewGroupMaps: existingFlatViewGroupMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatViewMaps',
          'flatFieldMetadataMaps',
          'flatViewGroupMaps',
        ],
      },
    );

    const { flatViewToUpdate, flatViewGroupsToDelete, flatViewGroupsToCreate } =
      fromUpdateViewInputToFlatViewToUpdateOrThrow({
        updateViewInput,
        flatViewMaps: existingFlatViewMaps,
        flatViewGroupMaps: existingFlatViewGroupMaps,
        flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
        userWorkspaceId,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatViewToUpdate],
            },
            viewGroup: {
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: flatViewGroupsToDelete,
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

    return fromFlatViewToViewDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: updateViewInput.id,
        flatEntityMaps: recomputedExistingFlatViewMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewInput,
    workspaceId,
  }: {
    deleteViewInput: DeleteViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewMaps: existingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
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
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewWithDeletedAt],
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

    return fromFlatViewToViewDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: deleteViewInput.id,
        flatEntityMaps: recomputedExistingFlatViewMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewInput,
    workspaceId,
  }: {
    destroyViewInput: DestroyViewInput;
    workspaceId: string;
  }): Promise<ViewDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewMaps: existingFlatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    const flatViewFromDestroyInput = fromDestroyViewInputToFlatViewOrThrow({
      destroyViewInput,
      flatViewMaps: existingFlatViewMaps,
    });

    const existingFlatView = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: flatViewFromDestroyInput.universalIdentifier,
      flatEntityMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatViewFromDestroyInput],
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
        'Multiple validation errors occurred while destroying view',
      );
    }

    return fromFlatViewToViewDto({
      ...existingFlatView,
      deletedAt: new Date().toISOString(),
    });
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

  private isViewVisibleToUser(
    view: {
      visibility: ViewVisibility;
      createdByUserWorkspaceId: string | null;
    },
    userWorkspaceId?: string,
  ): boolean {
    if (view.visibility === ViewVisibility.WORKSPACE) {
      return true;
    }

    return (
      view.visibility === ViewVisibility.UNLISTED &&
      isDefined(userWorkspaceId) &&
      view.createdByUserWorkspaceId === userWorkspaceId
    );
  }

  private async getFilteredFlatViews({
    workspaceId,
    objectMetadataId,
    userWorkspaceId,
    viewTypes,
  }: {
    workspaceId: string;
    objectMetadataId?: string;
    userWorkspaceId?: string;
    viewTypes?: ViewType[];
  }): Promise<FlatView[]> {
    const { flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    return Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatView) => flatView.workspaceId === workspaceId)
      .filter(
        (flatView) =>
          !objectMetadataId || flatView.objectMetadataId === objectMetadataId,
      )
      .filter((flatView) => flatView.deletedAt === null)
      .filter(
        (flatView) =>
          !viewTypes ||
          viewTypes.length === 0 ||
          viewTypes.includes(flatView.type),
      )
      .filter((flatView) => this.isViewVisibleToUser(flatView, userWorkspaceId))
      .sort((a, b) => a.position - b.position);
  }

  async findByWorkspaceId(
    workspaceId: string,
    userWorkspaceId?: string,
    viewTypes?: ViewType[],
  ): Promise<ViewDTO[]> {
    const flatViews = await this.getFilteredFlatViews({
      workspaceId,
      userWorkspaceId,
      viewTypes,
    });

    return flatViews.map(fromFlatViewToViewDto);
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    userWorkspaceId?: string,
    viewTypes?: ViewType[],
  ): Promise<ViewDTO[]> {
    const flatViews = await this.getFilteredFlatViews({
      workspaceId,
      objectMetadataId,
      userWorkspaceId,
      viewTypes,
    });

    return flatViews.map(fromFlatViewToViewDto);
  }

  async findById(id: string, workspaceId: string): Promise<ViewDTO | null> {
    const { flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView) || flatView.deletedAt !== null) {
      return null;
    }

    return fromFlatViewToViewDto(flatView);
  }

  async findManyWithRelationsFromCache(
    flatViews: FlatView[],
    workspaceId: string,
  ): Promise<ViewDTO[]> {
    const {
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatViewFilterMaps,
      flatViewFilterGroupMaps,
      flatViewSortMaps,
      flatViewGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatViewFieldMaps',
            'flatViewFieldGroupMaps',
            'flatViewFilterMaps',
            'flatViewFilterGroupMaps',
            'flatViewSortMaps',
            'flatViewGroupMaps',
          ],
        },
      );

    return flatViews.map((flatView) => {
      const viewDto = fromFlatViewToViewDto(flatView);

      viewDto.viewFields = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFieldIds,
        flatEntityMaps: flatViewFieldMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewFieldToViewFieldDto);

      viewDto.viewFieldGroups = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFieldGroupIds,
        flatEntityMaps: flatViewFieldGroupMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewFieldGroupToViewFieldGroupDto);

      viewDto.viewFilters = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFilterIds,
        flatEntityMaps: flatViewFilterMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewFilterToViewFilterDto);

      viewDto.viewFilterGroups = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFilterGroupIds,
        flatEntityMaps: flatViewFilterGroupMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewFilterGroupToViewFilterGroupDto);

      viewDto.viewSorts = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewSortIds,
        flatEntityMaps: flatViewSortMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewSortToViewSortDto);

      viewDto.viewGroups = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewGroupIds,
        flatEntityMaps: flatViewGroupMaps,
      })
        .filter((flatEntity) => flatEntity.deletedAt === null)
        .map(fromFlatViewGroupToViewGroupDto);

      return viewDto;
    });
  }

  async findByWorkspaceIdWithRelations(
    workspaceId: string,
    userWorkspaceId?: string,
    viewTypes?: ViewType[],
  ): Promise<ViewDTO[]> {
    const flatViews = await this.getFilteredFlatViews({
      workspaceId,
      userWorkspaceId,
      viewTypes,
    });

    return this.findManyWithRelationsFromCache(flatViews, workspaceId);
  }

  async findByObjectMetadataIdWithRelations(
    workspaceId: string,
    objectMetadataId: string,
    userWorkspaceId?: string,
    viewTypes?: ViewType[],
  ): Promise<ViewDTO[]> {
    const flatViews = await this.getFilteredFlatViews({
      workspaceId,
      objectMetadataId,
      userWorkspaceId,
      viewTypes,
    });

    return this.findManyWithRelationsFromCache(flatViews, workspaceId);
  }

  async findByIdWithRelations(
    id: string,
    workspaceId: string,
  ): Promise<ViewDTO | null> {
    const { flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView) || flatView.deletedAt !== null) {
      return null;
    }

    const results = await this.findManyWithRelationsFromCache(
      [flatView],
      workspaceId,
    );

    return results[0] ?? null;
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
