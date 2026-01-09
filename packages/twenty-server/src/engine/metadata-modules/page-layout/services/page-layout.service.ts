import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { fromCreatePageLayoutInputToFlatPageLayoutToCreate } from 'src/engine/metadata-modules/flat-page-layout/utils/from-create-page-layout-input-to-flat-page-layout-to-create.util';
import { fromDeletePageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-delete-page-layout-input-to-flat-page-layout-or-throw.util';
import { fromDestroyPageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-destroy-page-layout-input-to-flat-page-layout-or-throw.util';
import { fromRestorePageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-restore-page-layout-input-to-flat-page-layout-or-throw.util';
import {
  fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow,
  type UpdatePageLayoutInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout/utils/from-update-page-layout-input-to-flat-page-layout-to-update-or-throw.util';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-to-page-layout-dto.util';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

@Injectable()
export class PageLayoutService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(flatPageLayoutMaps.byId)
      .filter(isDefined)
      .filter((layout) => !isDefined(layout.deletedAt));

    return activeLayouts.map((layout) =>
      fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
        reconstructFlatPageLayoutWithTabsAndWidgets({
          layout,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
        }),
      ),
    );
  }

  async findByObjectMetadataId({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(flatPageLayoutMaps.byId)
      .filter(isDefined)
      .filter(
        (layout) =>
          layout.objectMetadataId === objectMetadataId &&
          !isDefined(layout.deletedAt),
      );

    return activeLayouts.map((layout) =>
      fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
        reconstructFlatPageLayoutWithTabsAndWidgets({
          layout,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
        }),
      ),
    );
  }

  async findByIdOrThrow({
    id,
    workspaceId,
    withSoftDeleted = false,
  }: {
    id: string;
    workspaceId: string;
    withSoftDeleted?: boolean;
  }): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const flatLayout = flatPageLayoutMaps.byId[id];

    const isLayoutNotFound =
      !isDefined(flatLayout) ||
      (!withSoftDeleted && isDefined(flatLayout.deletedAt));

    if (isLayoutNotFound) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    return fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
      reconstructFlatPageLayoutWithTabsAndWidgets({
        layout: flatLayout,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
        withSoftDeleted,
      }),
    );
  }

  private async getPageLayoutFlatEntityMaps(workspaceId: string): Promise<{
    flatPageLayoutMaps: FlatPageLayoutMaps;
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  }> {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatPageLayoutMaps',
          'flatPageLayoutTabMaps',
          'flatPageLayoutWidgetMaps',
        ],
      },
    );
  }

  async create({
    createPageLayoutInput,
    workspaceId,
  }: {
    createPageLayoutInput: CreatePageLayoutInput;
    workspaceId: string;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    if (!isNonEmptyString(createPageLayoutInput.name)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.NAME_REQUIRED,
        ),
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatPageLayoutToCreate =
      fromCreatePageLayoutInputToFlatPageLayoutToCreate({
        createPageLayoutInput,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [flatPageLayoutToCreate],
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
        'Multiple validation errors occurred while creating page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    return fromFlatPageLayoutToPageLayoutDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPageLayoutToCreate.id,
        flatEntityMaps: recomputedFlatPageLayoutMaps,
      }),
    );
  }

  async update({
    id,
    workspaceId,
    updateData,
  }: {
    id: string;
    workspaceId: string;
    updateData: UpdatePageLayoutInput;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const updatePageLayoutInput: UpdatePageLayoutInputWithId = {
      id,
      update: updateData,
    };

    const flatPageLayoutToUpdate =
      fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow({
        updatePageLayoutInput,
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const updatedLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: id,
        workspaceId,
        updatedAt: new Date(updatedLayout.updatedAt),
      },
    );

    return fromFlatPageLayoutToPageLayoutDto(updatedLayout);
  }

  async delete({
    id,
    workspaceId,
    isLinkedDashboardAlreadyDeleted = false,
  }: {
    id: string;
    workspaceId: string;
    isLinkedDashboardAlreadyDeleted?: boolean;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToDelete =
      fromDeletePageLayoutInputToFlatPageLayoutOrThrow({
        deletePageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToDelete],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const deletedLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    if (deletedLayout.type === PageLayoutType.DASHBOARD) {
      const deletedAt = isDefined(deletedLayout.deletedAt)
        ? new Date(deletedLayout.deletedAt)
        : new Date();

      await this.deleteAssociatedTabsAndWidgets({
        pageLayoutId: id,
        workspaceId,
        deletedAt,
      });

      if (!isLinkedDashboardAlreadyDeleted) {
        await this.deleteAssociatedDashboards({
          pageLayoutId: id,
          workspaceId,
          deletedAt,
        });
      }
    }

    return fromFlatPageLayoutToPageLayoutDto(deletedLayout);
  }

  async destroy({
    id,
    workspaceId,
    isLinkedDashboardAlreadyDestroyed = false,
  }: {
    id: string;
    workspaceId: string;
    isLinkedDashboardAlreadyDestroyed?: boolean;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToDestroy =
      fromDestroyPageLayoutInputToFlatPageLayoutOrThrow({
        destroyPageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatPageLayoutToDestroy],
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
        'Multiple validation errors occurred while destroying page layout',
      );
    }

    if (
      flatPageLayoutToDestroy.type === PageLayoutType.DASHBOARD &&
      !isLinkedDashboardAlreadyDestroyed
    ) {
      await this.destroyAssociatedDashboards({
        pageLayoutId: id,
        workspaceId,
      });
    }

    return fromFlatPageLayoutToPageLayoutDto(flatPageLayoutToDestroy);
  }

  async restore({
    id,
    workspaceId,
    isLinkedDashboardAlreadyRestored = false,
  }: {
    id: string;
    workspaceId: string;
    isLinkedDashboardAlreadyRestored?: boolean;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToRestore =
      fromRestorePageLayoutInputToFlatPageLayoutOrThrow({
        restorePageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToRestore],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const restoredLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    if (restoredLayout.type === PageLayoutType.DASHBOARD) {
      await this.restoreAssociatedTabsAndWidgets({
        pageLayoutId: id,
        workspaceId,
      });

      if (!isLinkedDashboardAlreadyRestored) {
        await this.restoreAssociatedDashboards({
          pageLayoutId: id,
          workspaceId,
        });
      }
    }

    return fromFlatPageLayoutToPageLayoutDto(restoredLayout);
  }

  private async destroyAssociatedDashboards({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        const dashboards = await dashboardRepository.find({
          where: {
            pageLayoutId,
          },
        });

        for (const dashboard of dashboards) {
          await dashboardRepository.delete(dashboard.id);
        }
      },
    );
  }

  private async deleteAssociatedTabsAndWidgets({
    pageLayoutId,
    workspaceId,
    deletedAt,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    deletedAt: Date;
  }): Promise<void> {
    const deletedTabIds = await this.pageLayoutTabService.deleteByPageLayoutId({
      pageLayoutId,
      workspaceId,
      deletedAt,
    });

    await this.pageLayoutWidgetService.deleteByTabIds({
      tabIds: deletedTabIds,
      workspaceId,
      deletedAt,
    });
  }

  private async deleteAssociatedDashboards({
    pageLayoutId,
    workspaceId,
    deletedAt,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    deletedAt: Date;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        await dashboardRepository.update({ pageLayoutId }, { deletedAt });
      },
    );
  }

  private async restoreAssociatedDashboards({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        await dashboardRepository.update({ pageLayoutId }, { deletedAt: null });
      },
    );
  }

  private async restoreAssociatedTabsAndWidgets({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<void> {
    const restoredTabIds =
      await this.pageLayoutTabService.restoreByPageLayoutId({
        pageLayoutId,
        workspaceId,
      });

    await this.pageLayoutWidgetService.restoreByTabIds({
      tabIds: restoredTabIds,
      workspaceId,
    });
  }
}
