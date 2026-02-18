import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class DashboardSyncService {
  private readonly logger = new Logger(DashboardSyncService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async isPageLayoutOfTypeDashboard({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const { flatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const pageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: pageLayoutId,
      flatEntityMaps: flatPageLayoutMaps,
    });

    return (
      isDefined(pageLayout) && pageLayout.type === PageLayoutType.DASHBOARD
    );
  }

  async updateLinkedDashboardsUpdatedAtByPageLayoutId({
    pageLayoutId,
    workspaceId,
    updatedAt,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    updatedAt: Date;
  }): Promise<void> {
    const isDashboard = await this.isPageLayoutOfTypeDashboard({
      pageLayoutId,
      workspaceId,
    });

    if (!isDashboard) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const dashboardRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

          await dashboardRepository.update({ pageLayoutId }, { updatedAt });
        },
        authContext,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update dashboard updatedAt for page layout ${pageLayoutId}: ${error}`,
      );
    }
  }

  async updateLinkedDashboardsUpdatedAtByTabId({
    tabId,
    workspaceId,
    updatedAt,
  }: {
    tabId: string;
    workspaceId: string;
    updatedAt: Date;
  }): Promise<void> {
    const { flatPageLayoutTabMaps, flatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps', 'flatPageLayoutMaps'],
        },
      );

    const tab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: tabId,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    if (!isDefined(tab)) {
      return;
    }

    const pageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: tab.pageLayoutId,
      flatEntityMaps: flatPageLayoutMaps,
    });

    if (
      !isDefined(pageLayout) ||
      pageLayout.type !== PageLayoutType.DASHBOARD
    ) {
      return;
    }

    await this.updateLinkedDashboardsUpdatedAtByPageLayoutId({
      pageLayoutId: tab.pageLayoutId,
      workspaceId,
      updatedAt,
    });
  }

  async updateLinkedDashboardsUpdatedAtByWidgetId({
    widgetId,
    workspaceId,
    updatedAt,
  }: {
    widgetId: string;
    workspaceId: string;
    updatedAt: Date;
  }): Promise<void> {
    const {
      flatPageLayoutWidgetMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatPageLayoutTabMaps',
            'flatPageLayoutMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetId,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (!isDefined(widget)) {
      return;
    }

    const tab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widget.pageLayoutTabId,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    if (!isDefined(tab)) {
      return;
    }

    const pageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: tab.pageLayoutId,
      flatEntityMaps: flatPageLayoutMaps,
    });

    if (
      !isDefined(pageLayout) ||
      pageLayout.type !== PageLayoutType.DASHBOARD
    ) {
      return;
    }

    await this.updateLinkedDashboardsUpdatedAtByPageLayoutId({
      pageLayoutId: tab.pageLayoutId,
      workspaceId,
      updatedAt,
    });
  }
}
