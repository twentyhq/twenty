import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-create-page-layout-widget-input-to-flat-page-layout-widget-to-create.util';
import { fromDeletePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-delete-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import { fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-destroy-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import {
  fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow,
  UpdatePageLayoutWidgetInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-update-page-layout-widget-input-to-flat-page-layout-widget-to-update-or-throw.util';
import { CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { DeletePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/delete-page-layout-widget.input';
import { DestroyPageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/destroy-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout-widget.dto';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout-widget.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
  ) {}

  async createOne({
    createPageLayoutWidgetInput,
    workspaceId,
  }: {
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const [createdPageLayoutWidget] = await this.createMany({
      workspaceId,
      createPageLayoutWidgetInputs: [createPageLayoutWidgetInput],
    });

    if (!isDefined(createdPageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        'Failed to create page layout widget',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    return createdPageLayoutWidget;
  }

  async createMany({
    createPageLayoutWidgetInputs,
    workspaceId,
  }: {
    createPageLayoutWidgetInputs: CreatePageLayoutWidgetInput[];
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO[]> {
    if (createPageLayoutWidgetInputs.length === 0) {
      return [];
    }

    const { flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const flatPageLayoutWidgetsToCreate = createPageLayoutWidgetInputs.map(
      (createPageLayoutWidgetInput) =>
        fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate({
          createPageLayoutWidgetInput,
          workspaceId,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatPageLayoutWidgetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatPageLayoutWidgetMaps,
              flatEntityToCreate: flatPageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {},
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating page layout widgets',
      );
    }

    const {
      flatPageLayoutWidgetMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatPageLayoutWidgetsToCreate.map((el) => el.id),
      flatEntityMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    });
  }

  async updateOne({
    updatePageLayoutWidgetInput,
    workspaceId,
  }: {
    workspaceId: string;
    updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId;
  }): Promise<PageLayoutWidgetDTO> {
    const { flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const optimisticallyUpdatedFlatPageLayoutWidget =
      fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow({
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
        updatePageLayoutWidgetInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatPageLayoutWidgetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatPageLayoutWidgetMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatPageLayoutWidget],
            }),
          },
          dependencyAllFlatEntityMaps: {},
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout widget',
      );
    }

    const {
      flatPageLayoutWidgetMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatPageLayoutWidget.id,
      flatEntityMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    });
  }

  async deleteOne({
    deletePageLayoutWidgetInput,
    workspaceId,
  }: {
    deletePageLayoutWidgetInput: DeletePageLayoutWidgetInput;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const { flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const optimisticallyUpdatedFlatPageLayoutWidgetWithDeletedAt =
      fromDeletePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow({
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
        deletePageLayoutWidgetInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatPageLayoutWidgetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatPageLayoutWidgetMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatPageLayoutWidgetWithDeletedAt,
              ],
            }),
          },
          dependencyAllFlatEntityMaps: {},
          buildOptions: {
            isSystemBuild: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting page layout widget',
      );
    }

    const {
      flatPageLayoutWidgetMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatPageLayoutWidgetWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatPageLayoutWidgetMaps,
    });
  }

  async destroyOne({
    destroyPageLayoutWidgetInput,
    workspaceId,
  }: {
    destroyPageLayoutWidgetInput: DestroyPageLayoutWidgetInput;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const { flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const existingPageLayoutWidgetToDelete =
      fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow({
        destroyPageLayoutWidgetInput,
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatPageLayoutWidgetMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatPageLayoutWidgetMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [existingPageLayoutWidgetToDelete],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {},
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              pageLayoutWidget: true,
            },
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting page layout widget',
      );
    }

    return existingPageLayoutWidgetToDelete;
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity[]> {
    return this.pageLayoutWidgetRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByPageLayoutTabId(
    workspaceId: string,
    pageLayoutTabId: string,
    withDeleted = false,
  ): Promise<PageLayoutWidgetEntity[]> {
    return this.pageLayoutWidgetRepository.find({
      where: {
        workspaceId,
        pageLayoutTabId,
      },
      order: { createdAt: 'ASC' },
      withDeleted,
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity | null> {
    const pageLayoutWidget = await this.pageLayoutWidgetRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return pageLayoutWidget || null;
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.findById(id, workspaceId);

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        `Page layout widget with ID "${id}" not found`,
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    return pageLayoutWidget;
  }

  async restoreOne({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const pageLayoutWidget = await this.pageLayoutWidgetRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        `Page layout widget with ID "${id}" not found`,
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayoutWidget.deletedAt)) {
      throw new PageLayoutWidgetException(
        'Page layout widget is not deleted',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    await this.pageLayoutWidgetRepository.restore(id);

    const restoredWidget = await this.findByIdOrThrow(id, workspaceId);

    return restoredWidget;
  }
}
