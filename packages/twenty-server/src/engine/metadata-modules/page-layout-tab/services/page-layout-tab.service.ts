import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-create-page-layout-tab-input-to-flat-page-layout-tab-to-create.util';
import { fromDestroyPageLayoutTabInputToFlatPageLayoutTabOrThrow } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/from-destroy-page-layout-tab-input-to-flat-page-layout-tab-or-throw.util';
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
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

type TabMigrationOperations = {
  flatEntityToCreate: FlatPageLayoutTab[];
  flatEntityToUpdate: FlatPageLayoutTab[];
  flatEntityToDelete: FlatPageLayoutTab[];
};

@Injectable()
export class PageLayoutTabService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
  ) {}

  async findByPageLayoutId({
    workspaceId,
    pageLayoutId,
  }: {
    workspaceId: string;
    pageLayoutId: string;
  }): Promise<PageLayoutTabDTO[]> {
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

  async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutTabDTO> {
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

  async create({
    createPageLayoutTabInput,
    workspaceId,
  }: {
    createPageLayoutTabInput: CreatePageLayoutTabInput;
    workspaceId: string;
  }): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
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

    const createdTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatPageLayoutTabToCreate.id,
      flatEntityMaps: recomputedFlatPageLayoutTabMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByTabId({
      tabId: flatPageLayoutTabToCreate.id,
      workspaceId,
      updatedAt: new Date(createdTab.updatedAt),
    });

    return fromFlatPageLayoutTabToPageLayoutTabDto(createdTab);
  }

  async update({
    id,
    workspaceId,
    updateData,
  }: {
    id: string;
    workspaceId: string;
    updateData: UpdatePageLayoutTabInput;
  }): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
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

    const updatedTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutTabMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByTabId({
      tabId: id,
      workspaceId,
      updatedAt: new Date(updatedTab.updatedAt),
    });

    return fromFlatPageLayoutTabToPageLayoutTabDto(updatedTab);
  }

  async destroy({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
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

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByTabId({
      tabId: id,
      workspaceId,
      updatedAt: new Date(),
    });

    return true;
  }

  async deleteByPageLayoutId({
    pageLayoutId,
    workspaceId,
    deletedAt,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    deletedAt: Date;
  }): Promise<string[]> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const tabsToDelete = Object.values(existingFlatPageLayoutTabMaps.byId)
      .filter(isDefined)
      .filter(
        (tab) => tab.pageLayoutId === pageLayoutId && !isDefined(tab.deletedAt),
      )
      .map((tab) => ({
        ...tab,
        deletedAt: deletedAt.toISOString(),
      }));

    if (tabsToDelete.length === 0) {
      return [];
    }

    await this.validateAndRunTabMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: tabsToDelete,
      },
      errorMessage:
        'Multiple validation errors occurred while deleting page layout tabs by page layout id',
    });

    return tabsToDelete.map((tab) => tab.id);
  }

  async restoreByPageLayoutId({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const { flatPageLayoutTabMaps: existingFlatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const tabsToRestore = Object.values(existingFlatPageLayoutTabMaps.byId)
      .filter(isDefined)
      .filter(
        (tab) => tab.pageLayoutId === pageLayoutId && isDefined(tab.deletedAt),
      )
      .map((tab) => ({
        ...tab,
        deletedAt: null,
      }));

    if (tabsToRestore.length === 0) {
      return [];
    }

    await this.validateAndRunTabMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: tabsToRestore,
      },
      errorMessage:
        'Multiple validation errors occurred while restoring page layout tabs by page layout id',
    });

    return tabsToRestore.map((tab) => tab.id);
  }

  private async validateAndRunTabMigration({
    workspaceId,
    operations,
    errorMessage,
  }: {
    workspaceId: string;
    operations: TabMigrationOperations;
    errorMessage: string;
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: operations,
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }
}
