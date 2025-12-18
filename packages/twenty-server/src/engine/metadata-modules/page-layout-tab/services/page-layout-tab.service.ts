import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-create-page-layout-tab-input-to-flat-page-layout-tab-to-create.util';
import { fromDeletePageLayoutTabInputToFlatPageLayoutTabOrThrow } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-delete-page-layout-tab-input-to-flat-page-layout-tab-or-throw.util';
import { fromDestroyPageLayoutTabInputToFlatPageLayoutTabOrThrow } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-destroy-page-layout-tab-input-to-flat-page-layout-tab-or-throw.util';
import { fromRestorePageLayoutTabInputToFlatPageLayoutTabOrThrow } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-restore-page-layout-tab-input-to-flat-page-layout-tab-or-throw.util';
import {
  fromUpdatePageLayoutTabInputToFlatPageLayoutTabToUpdateOrThrow,
  type UpdatePageLayoutTabInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-update-page-layout-tab-input-to-flat-page-layout-tab-to-update-or-throw.util';
import { reconstructFlatPageLayoutTabWithWidgets } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/reconstruct-flat-page-layout-tab-with-widgets.util';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';
import { UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { fromFlatPageLayoutTabToPageLayoutTabDto } from 'src/engine/metadata-modules/page-layout-tab/utils/from-flat-page-layout-tab-to-page-layout-tab-dto.util';
import { fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto } from 'src/engine/metadata-modules/page-layout-tab/utils/from-flat-page-layout-tab-with-widgets-to-page-layout-tab-dto.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PageLayoutTabService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findByPageLayoutId(
    workspaceId: string,
    pageLayoutId: string,
  ): Promise<PageLayoutTabDTO[]> {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.getPageLayoutTabFlatEntityMaps(workspaceId);

    return Object.values(flatPageLayoutTabMaps.byId)
      .filter(isDefined)
      .filter(
        (tab) => tab.pageLayoutId === pageLayoutId && !isDefined(tab.deletedAt),
      )
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((tab) =>
        fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto(
          reconstructFlatPageLayoutTabWithWidgets({
            tab,
            flatPageLayoutWidgetMaps,
          }),
        ),
      );
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutTabDTO> {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.getPageLayoutTabFlatEntityMaps(workspaceId);

    const flatTab = flatPageLayoutTabMaps.byId[id];

    if (!isDefined(flatTab) || isDefined(flatTab.deletedAt)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    return fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto(
      reconstructFlatPageLayoutTabWithWidgets({
        tab: flatTab,
        flatPageLayoutWidgetMaps,
      }),
    );
  }

  private async getPageLayoutTabFlatEntityMaps(workspaceId: string): Promise<{
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  }> {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: ['flatPageLayoutTabMaps', 'flatPageLayoutWidgetMaps'],
      },
    );
  }

  async create(
    createPageLayoutTabInput: CreatePageLayoutTabInput,
    workspaceId: string,
  ): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    if (!isDefined(createPageLayoutTabInput.title)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    if (!isDefined(createPageLayoutTabInput.pageLayoutId)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_ID_REQUIRED,
        ),
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatPageLayoutTabToCreate =
      fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate({
        createPageLayoutTabInput,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [flatPageLayoutTabToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating page layout tab',
      );
    }

    const { flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    return fromFlatPageLayoutTabToPageLayoutTabDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPageLayoutTabToCreate.id,
        flatEntityMaps: recomputedFlatPageLayoutTabMaps,
      }),
    );
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutTabInput,
  ): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const updatePageLayoutTabInput: UpdatePageLayoutTabInputWithId = {
      id,
      update: updateData,
    };

    const flatPageLayoutTabToUpdate =
      fromUpdatePageLayoutTabInputToFlatPageLayoutTabToUpdateOrThrow({
        updatePageLayoutTabInput,
        flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutTabToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout tab',
      );
    }

    const { flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    return fromFlatPageLayoutTabToPageLayoutTabDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutTabMaps,
      }),
    );
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const flatPageLayoutTabToDelete =
      fromDeletePageLayoutTabInputToFlatPageLayoutTabOrThrow({
        deletePageLayoutTabInput: { id },
        flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutTabToDelete],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting page layout tab',
      );
    }

    const { flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    return fromFlatPageLayoutTabToPageLayoutTabDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutTabMaps,
      }),
    );
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const flatPageLayoutTabToDestroy =
      fromDestroyPageLayoutTabInputToFlatPageLayoutTabOrThrow({
        destroyPageLayoutTabInput: { id },
        flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatPageLayoutTabToDestroy],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying page layout tab',
      );
    }

    return true;
  }

  async restore(
    id: string,
    workspaceId: string,
  ): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const flatPageLayoutTabToRestore =
      fromRestorePageLayoutTabInputToFlatPageLayoutTabOrThrow({
        restorePageLayoutTabInput: { id },
        flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutTabToRestore],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring page layout tab',
      );
    }

    const { flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    return fromFlatPageLayoutTabToPageLayoutTabDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutTabMaps,
      }),
    );
  }
}
