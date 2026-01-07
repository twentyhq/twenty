import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class DashboardSyncService {
  private readonly logger = new Logger(DashboardSyncService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async updateLinkedDashboardsUpdatedAtByPageLayoutId({
    pageLayoutId,
    workspaceId,
    updatedAt,
  }: {
    pageLayoutId: string;
    workspaceId: string;
    updatedAt: Date;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const dashboardRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

          await dashboardRepository.update({ pageLayoutId }, { updatedAt });
        },
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
    const { flatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const tab = flatPageLayoutTabMaps.byId[tabId];

    if (!isDefined(tab)) {
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
    const { flatPageLayoutWidgetMaps, flatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps', 'flatPageLayoutTabMaps'],
        },
      );

    const widget = flatPageLayoutWidgetMaps.byId[widgetId];

    if (!isDefined(widget)) {
      return;
    }

    const tab = flatPageLayoutTabMaps.byId[widget.pageLayoutTabId];

    if (!isDefined(tab)) {
      return;
    }

    await this.updateLinkedDashboardsUpdatedAtByPageLayoutId({
      pageLayoutId: tab.pageLayoutId,
      workspaceId,
      updatedAt,
    });
  }
}
